#!/bin/bash

# Check if commit message is provided
if [ -z "$1" ]; then
  echo "❌ Error: Commit message is required."
  echo "👉 Usage: ./gitpush.sh \"Your commit message\""
  exit 1
fi

# Add changes
git add .

# Commit with the provided message
git commit -m "$1"

# Push to the current branch
git push origin "$(git branch --show-current)"
