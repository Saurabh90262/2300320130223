#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}College Notification System - Setup${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js found: $(node -v)${NC}"

# Setup Backend
echo -e "\n${YELLOW}Setting up Backend...${NC}"
cd notification_app_be

if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env from .env.example${NC}"
fi

npm install
echo -e "${GREEN}✅ Backend dependencies installed${NC}"

# Setup Frontend
echo -e "\n${YELLOW}Setting up Frontend...${NC}"
cd ../notification_app_fe

if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo -e "${GREEN}✅ Created .env.local from .env.example${NC}"
fi

npm install
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"

echo -e "\n${YELLOW}📋 Next Steps:${NC}"
echo -e "1. Start MongoDB: ${GREEN}mongod${NC}"
echo -e "2. Start Redis: ${GREEN}redis-server${NC}"
echo -e "3. Start Backend: ${GREEN}cd notification_app_be && npm run dev${NC}"
echo -e "4. Start Frontend: ${GREEN}cd notification_app_fe && npm run dev${NC}"
echo -e "5. Open browser: ${GREEN}http://localhost:3000${NC}"

echo -e "\n${GREEN}✅ Setup complete!${NC}"
