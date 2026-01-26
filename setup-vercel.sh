#!/bin/bash
# Bash script to set up Vercel file structure
# Run this in the project root directory

echo "Setting up Vercel file structure..."

# Create public directory if it doesn't exist
if [ ! -d "public" ]; then
    mkdir -p public
    echo "Created public/ directory"
fi

# Move HTML files to public
if ls *.html 1> /dev/null 2>&1; then
    echo "Moving HTML files to public/..."
    mv *.html public/
    echo "HTML files moved"
else
    echo "No HTML files found to move"
fi

# Move assets directory to public if it exists
if [ -d "assets" ]; then
    if [ -d "public/assets" ]; then
        echo "public/assets already exists, skipping..."
    else
        mv assets public/
        echo "Moved assets/ to public/assets/"
    fi
else
    echo "assets/ directory not found"
fi

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Review the files in public/ directory"
echo "2. Install dependencies: npm install"
echo "3. Set up Vercel KV in dashboard"
echo "4. Deploy to Vercel"
echo "5. Call /api/secure-portal/init after deployment"
