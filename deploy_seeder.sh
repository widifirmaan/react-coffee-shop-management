#!/bin/bash
SERVER="widifirmaan@widiserver.macaroni-pumpkinseed.ts.net"

echo "--- Deployment Helper ---"

# 1. Attempt to find the remote path
echo "🔍 Searching for project directory on server..."
REMOTE_PATH=$(ssh $SERVER "find ~ -maxdepth 4 -type d -name 'Springboot-React-Americano' 2>/dev/null | head -n 1")

if [ -z "$REMOTE_PATH" ]; then
    echo "⚠️ Could not automatically find 'Springboot-React-Americano' directory on the server."
    echo "Please check where you cloned the project on the remote server."
    read -p "Enter the absolute remote path (e.g., /home/widifirmaan/Springboot-React-Americano): " REMOTE_PATH
else
    echo "✅ Found project at: $REMOTE_PATH"
fi

# 2. Confirm deployment
read -p "Deploy updates to $REMOTE_PATH? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 1
fi

# 3. Transfer Files
echo "🚀 Transferring modified files..."
scp backend/src/main/java/com/americano/coffeeshop/controller/SeederController.java $SERVER:$REMOTE_PATH/backend/src/main/java/com/americano/coffeeshop/controller/
scp backend/src/main/java/com/americano/coffeeshop/config/DataLoader.java $SERVER:$REMOTE_PATH/backend/src/main/java/com/americano/coffeeshop/config/
scp backend/src/main/java/com/americano/coffeeshop/config/SecurityConfig.java $SERVER:$REMOTE_PATH/backend/src/main/java/com/americano/coffeeshop/config/

# 4. Rebuild Container
echo "🛠️ Rebuilding backend container..."
ssh $SERVER "cd $REMOTE_PATH && docker-compose up -d --build backend"

echo "✅ Deployment complete!"
echo "You can now run the seeder at: https://nyafe.widifirmaan.web.id/api/seeder/run"
