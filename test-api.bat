@echo off
REM Service Marketplace Backend - API Testing Script (Windows)
REM Simply run: test-api.bat

setlocal enabledelayedexpansion

set BASE_URL=http://localhost:5000

echo.
echo ================================================
echo Service Marketplace API - Testing Script
echo ================================================
echo.

REM Test 1: Health Check
echo [Test 1] Health Check
echo GET /health
echo.
curl -s %BASE_URL%/health
echo.
echo.

REM Test 2: Register Normal User
echo [Test 2] Register Normal User
echo POST /user/register
echo.
for /f "delims=" %%A in ('curl -s -X POST %BASE_URL%/user/register ^
  -H "Content-Type: application/json" ^
  -d "{"name": "John Doe", "phoneNumber": "1234567890"}"') do (
  set USER_RESPONSE=%%A
)
echo %USER_RESPONSE%
echo.
echo.

REM Test 3: Register Worker
echo [Test 3] Register Worker
echo POST /worker/register
echo.
curl -s -X POST %BASE_URL%/worker/register ^
  -H "Content-Type: application/json" ^
  -d "{"name": "Jane Smith", "phoneNumber": "9876543210", "experienceYears": 5, "bio": "Professional Electrician"}"
echo.
echo.

REM Test 4: Add Location
echo [Test 4] Add Location for Worker
echo POST /location/2
echo.
curl -s -X POST %BASE_URL%/location/2 ^
  -H "Content-Type: application/json" ^
  -d "{"latitude": 40.7128, "longitude": -74.0060, "areaName": "New York, NY"}"
echo.
echo.

REM Test 5: Get Worker Details
echo [Test 5] Get Worker Details
echo GET /worker/2
echo.
curl -s %BASE_URL%/worker/2
echo.
echo.

REM Test 6: Get Location
echo [Test 6] Get Location
echo GET /location/2
echo.
curl -s %BASE_URL%/location/2
echo.
echo.

REM Test 7: Error - Missing Fields
echo [Test 7] Error - Missing Required Fields
echo POST /user/register (missing phoneNumber)
echo.
curl -s -X POST %BASE_URL%/user/register ^
  -H "Content-Type: application/json" ^
  -d "{"name": "Incomplete"}"
echo.
echo.

REM Test 8: Error - Invalid Phone
echo [Test 8] Error - Invalid Phone Number
echo POST /user/register (short phone)
echo.
curl -s -X POST %BASE_URL%/user/register ^
  -H "Content-Type: application/json" ^
  -d "{"name": "Test", "phoneNumber": "123"}"
echo.
echo.

REM Test 9: Error - Duplicate Phone
echo [Test 9] Error - Duplicate Phone Number
echo POST /user/register (same phone as Test 2)
echo.
curl -s -X POST %BASE_URL%/user/register ^
  -H "Content-Type: application/json" ^
  -d "{"name": "Another User", "phoneNumber": "1234567890"}"
echo.
echo.

REM Test 10: Error - Invalid Coordinates
echo [Test 10] Error - Invalid Latitude
echo POST /location/2 (latitude > 90)
echo.
curl -s -X POST %BASE_URL%/location/2 ^
  -H "Content-Type: application/json" ^
  -d "{"latitude": 91, "longitude": -74.0060}"
echo.
echo.

REM Test 11: Delete Location
echo [Test 11] Delete Location
echo DELETE /location/2
echo.
curl -s -X DELETE %BASE_URL%/location/2
echo.
echo.

REM Test 12: Error - Location Not Found
echo [Test 12] Error - Location Not Found
echo GET /location/2 (after delete)
echo.
curl -s %BASE_URL%/location/2
echo.
echo.

REM Test 13: Error - Worker Not Found
echo [Test 13] Error - Worker Not Found
echo GET /worker/9999
echo.
curl -s %BASE_URL%/worker/9999
echo.
echo.

REM Test 14: Error - Route Not Found
echo [Test 14] Error - Route Not Found
echo GET /invalid/route
echo.
curl -s %BASE_URL%/invalid/route
echo.
echo.

echo ================================================
echo All Tests Completed!
echo ================================================
echo.

pause
