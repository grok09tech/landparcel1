from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Optional, List
import uuid
from passlib.context import CryptContext

from app.models.user import User, UserRole, UserPermission
from app.schemas.user import UserCreate, UserUpdate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_password_hash(self, password: str) -> str:
        return pwd_context.hash(password)
    
    def create_user(self, user_data: UserCreate) -> User:
        """Create a new user"""
        db_user = User(
            email=user_data.email,
            password_hash=self.get_password_hash(user_data.password),
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            phone=user_data.phone,
            role=user_data.role
        )
        
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        
        return db_user
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        return self.db.query(User).filter(User.email == email).first()
    
    def get_user_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        """Get user by ID"""
        return self.db.query(User).filter(User.id == user_id).first()
    
    def update_user(self, user_id: uuid.UUID, user_update: UserUpdate) -> User:
        """Update user information"""
        user = self.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        update_data = user_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        self.db.commit()
        self.db.refresh(user)
        
        return user
    
    def get_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        """Get list of users"""
        return self.db.query(User).offset(skip).limit(limit).all()
    
    def deactivate_user(self, user_id: uuid.UUID) -> User:
        """Deactivate user account"""
        user = self.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        user.is_active = False
        self.db.commit()
        self.db.refresh(user)
        
        return user
    
    def grant_permission(self, user_id: uuid.UUID, permission: str, resource: str = None, granted_by: uuid.UUID = None):
        """Grant permission to user"""
        # Check if permission already exists
        existing = self.db.query(UserPermission).filter(
            and_(
                UserPermission.user_id == user_id,
                UserPermission.permission == permission,
                UserPermission.resource == resource
            )
        ).first()
        
        if existing:
            return existing
        
        db_permission = UserPermission(
            user_id=user_id,
            permission=permission,
            resource=resource,
            granted_by=granted_by
        )
        
        self.db.add(db_permission)
        self.db.commit()
        self.db.refresh(db_permission)
        
        return db_permission
    
    def revoke_permission(self, user_id: uuid.UUID, permission: str, resource: str = None):
        """Revoke permission from user"""
        permission_obj = self.db.query(UserPermission).filter(
            and_(
                UserPermission.user_id == user_id,
                UserPermission.permission == permission,
                UserPermission.resource == resource
            )
        ).first()
        
        if permission_obj:
            self.db.delete(permission_obj)
            self.db.commit()
            return True
        
        return False
    
    def get_user_permissions(self, user_id: uuid.UUID) -> List[UserPermission]:
        """Get all permissions for a user"""
        return self.db.query(UserPermission).filter(UserPermission.user_id == user_id).all()
    
    def has_permission(self, user_id: uuid.UUID, permission: str, resource: str = None) -> bool:
        """Check if user has specific permission"""
        # Check direct permission
        direct_permission = self.db.query(UserPermission).filter(
            and_(
                UserPermission.user_id == user_id,
                UserPermission.permission == permission,
                UserPermission.resource == resource
            )
        ).first()
        
        if direct_permission:
            return True
        
        # Check role-based permissions
        user = self.get_user_by_id(user_id)
        if not user:
            return False
        
        role = self.db.query(UserRole).filter(UserRole.name == user.role).first()
        if role and permission in role.permissions:
            return True
        
        return False