#!/bin/bash

# Stop script on error
set -e

echo "=========================================="
echo "      UPDATING COFFEESHOP APP            "
echo "=========================================="

# 1. Pull latest changes
echo "[1/3] Pulling latest code from Git..."
git pull

# 2. Rebuild Backend with No Cache
# This is crucial to ensure Java code changes (like SecurityConfig) are actually recompiled
echo "[2/3] Rebuilding Backend (forcing no-cache)..."
docker compose build --no-cache backend

# 3. Restart Containers
echo "[3/3] Restarting Services..."
docker compose up -d --remove-orphans

echo "=========================================="
echo "      DEPLOYMENT SUCCESSFUL!             "
echo "=========================================="
