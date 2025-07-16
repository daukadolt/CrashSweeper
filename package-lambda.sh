#!/bin/bash

echo "Creating Lambda packages..."

# Create lambda-store package
echo "Creating lambda-store.zip..."
cd lambda
npm install
zip -r ../lambda-store.zip store.js package.json node_modules/
cd ..

# Create lambda-monitor package  
echo "Creating lambda-monitor.zip..."
cd lambda
zip -r ../lambda-monitor.zip monitor.js package.json node_modules/
cd ..

echo "Lambda packages created:"
echo "- lambda-store.zip"
echo "- lambda-monitor.zip" 