#!/bin/bash

# Service Marketplace Backend - API Testing Script
# Run all tests with: bash test-api.sh

BASE_URL="http://localhost:5000"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}Service Marketplace API - Testing Script${NC}"
echo -e "${BLUE}================================================${NC}\n"

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
echo -e "${BLUE}GET /health${NC}"
curl -s http://localhost:5000/health | python -m json.tool
echo -e "\n"

# Test 2: Register Normal User
echo -e "${YELLOW}Test 2: Register Normal User${NC}"
echo -e "${BLUE}POST /user/register${NC}"
USER_RESPONSE=$(curl -s -X POST http://localhost:5000/user/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "phoneNumber": "1234567890"}')
echo "$USER_RESPONSE" | python -m json.tool
USER_ID=$(echo "$USER_RESPONSE" | python -c "import sys, json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null || echo "1")
echo -e "User ID: $USER_ID\n"

# Test 3: Register Worker
echo -e "${YELLOW}Test 3: Register Worker${NC}"
echo -e "${BLUE}POST /worker/register${NC}"
WORKER_RESPONSE=$(curl -s -X POST http://localhost:5000/worker/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Smith", "phoneNumber": "9876543210", "experienceYears": 5, "bio": "Professional Electrician"}')
echo "$WORKER_RESPONSE" | python -m json.tool
WORKER_ID=$(echo "$WORKER_RESPONSE" | python -c "import sys, json; print(json.load(sys.stdin)['data']['user']['id'])" 2>/dev/null || echo "2")
echo -e "Worker ID: $WORKER_ID\n"

# Test 4: Add Location
echo -e "${YELLOW}Test 4: Add Location for Worker${NC}"
echo -e "${BLUE}POST /location/:userId${NC}"
curl -s -X POST http://localhost:5000/location/$WORKER_ID \
  -H "Content-Type: application/json" \
  -d '{"latitude": 40.7128, "longitude": -74.0060, "areaName": "New York, NY"}' | python -m json.tool
echo -e "\n"

# Test 5: Get Worker Details
echo -e "${YELLOW}Test 5: Get Worker Details${NC}"
echo -e "${BLUE}GET /worker/:id${NC}"
curl -s http://localhost:5000/worker/$WORKER_ID | python -m json.tool
echo -e "\n"

# Test 6: Get Location
echo -e "${YELLOW}Test 6: Get Location${NC}"
echo -e "${BLUE}GET /location/:userId${NC}"
curl -s http://localhost:5000/location/$WORKER_ID | python -m json.tool
echo -e "\n"

# Test 7: Error - Missing Fields
echo -e "${YELLOW}Test 7: Error - Missing Required Fields${NC}"
echo -e "${BLUE}POST /user/register (missing phoneNumber)${NC}"
curl -s -X POST http://localhost:5000/user/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Incomplete"}' | python -m json.tool
echo -e "\n"

# Test 8: Error - Invalid Phone
echo -e "${YELLOW}Test 8: Error - Invalid Phone Number${NC}"
echo -e "${BLUE}POST /user/register (short phone)${NC}"
curl -s -X POST http://localhost:5000/user/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "phoneNumber": "123"}' | python -m json.tool
echo -e "\n"

# Test 9: Error - Duplicate Phone
echo -e "${YELLOW}Test 9: Error - Duplicate Phone Number${NC}"
echo -e "${BLUE}POST /user/register (same phone as Test 2)${NC}"
curl -s -X POST http://localhost:5000/user/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Another User", "phoneNumber": "1234567890"}' | python -m json.tool
echo -e "\n"

# Test 10: Error - Invalid Coordinates
echo -e "${YELLOW}Test 10: Error - Invalid Latitude${NC}"
echo -e "${BLUE}POST /location/:userId (latitude > 90)${NC}"
curl -s -X POST http://localhost:5000/location/$WORKER_ID \
  -H "Content-Type: application/json" \
  -d '{"latitude": 91, "longitude": -74.0060}' | python -m json.tool
echo -e "\n"

# Test 11: Delete Location
echo -e "${YELLOW}Test 11: Delete Location${NC}"
echo -e "${BLUE}DELETE /location/:userId${NC}"
curl -s -X DELETE http://localhost:5000/location/$WORKER_ID | python -m json.tool
echo -e "\n"

# Test 12: Error - Location Not Found
echo -e "${YELLOW}Test 12: Error - Location Not Found${NC}"
echo -e "${BLUE}GET /location/:userId (after delete)${NC}"
curl -s http://localhost:5000/location/$WORKER_ID | python -m json.tool
echo -e "\n"

# Test 13: Error - Worker Not Found
echo -e "${YELLOW}Test 13: Error - Worker Not Found${NC}"
echo -e "${BLUE}GET /worker/:id (invalid id)${NC}"
curl -s http://localhost:5000/worker/9999 | python -m json.tool
echo -e "\n"

# Test 14: Error - Route Not Found
echo -e "${YELLOW}Test 14: Error - Route Not Found${NC}"
echo -e "${BLUE}GET /invalid/route${NC}"
curl -s http://localhost:5000/invalid/route | python -m json.tool
echo -e "\n"

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}All Tests Completed!${NC}"
echo -e "${GREEN}================================================${NC}\n"
