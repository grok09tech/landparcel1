#!/bin/bash

# Tanzania Land Parcel System - Quick Start Script

echo "🚀 Starting Tanzania Land Parcel System Setup..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Backend Setup
echo "📦 Setting up backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Backend .env file not found. Please create backend/.env with your Supabase credentials."
    echo "See setup-instructions.md for details."
else
    echo "✅ Backend .env file found"
fi

# Go back to root
cd ..

# Frontend Setup
echo "📦 Setting up frontend..."

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Frontend .env file not found. Please create .env with your Supabase credentials."
    echo "See setup-instructions.md for details."
else
    echo "✅ Frontend .env file found"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your .env files with Supabase credentials"
echo "2. Run the backend: cd backend && source venv/bin/activate && python scripts/seed_enhanced_data.py && uvicorn app.main:app --reload"
echo "3. Run the frontend: npm run dev"
echo ""
echo "📖 For detailed instructions, see setup-instructions.md"