#!/bin/bash

# ============================================
# TEST SCRIPT - GGC Onboarding API
# ============================================

echo "🧪 Testing Geek Gaming Center Onboarding API"
echo "=============================================="
echo ""

BASE_URL="http://localhost:3000"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Register new customer
echo -e "${YELLOW}Test 1: Register new customer${NC}"
echo "================================"

REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Erwan",
    "lastName": "Test",
    "email": "erwan.test@example.com",
    "phone": "+237659690099",
    "city": "Douala",
    "howDidYouFindUs": "social_media",
    "acceptCGV": true
  }')

echo "$REGISTER_RESPONSE" | jq '.'

# Check if registration was successful
if echo "$REGISTER_RESPONSE" | jq -e '.success' > /dev/null; then
  echo -e "${GREEN}✅ Registration successful${NC}\n"

  # Extract customer ID and verification token
  CUSTOMER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.data.customerId')
  echo "Customer ID: $CUSTOMER_ID"

  # Test 2: Verify email (we need to get the token from database)
  echo -e "${YELLOW}Test 2: Get email verification token from database${NC}"
  echo "========================================"

  # For this test, we'll use a script to get the token
  # In production, the user would click the link in their email

  # Test 3: Verify phone
  echo -e "${YELLOW}Test 3: Verify phone with SMS code${NC}"
  echo "=========================================="

  # We need to get the SMS code from database logs
  # For testing, let's try to resend the SMS

  RESEND_SMS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/verify-phone?customer=$CUSTOMER_ID")
  echo "$RESEND_SMS_RESPONSE" | jq '.'

  # Test 4: Forgot password
  echo -e "${YELLOW}Test 4: Request password reset${NC}"
  echo "================================"

  FORGOT_PASSWORD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/forgot-password" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "erwan.test@example.com"
    }')

  echo "$FORGOT_PASSWORD_RESPONSE" | jq '.'

else
  echo -e "${RED}❌ Registration failed${NC}"
  echo "$REGISTER_RESPONSE"
fi

echo ""
echo "========================================="
echo -e "${GREEN}✅ Tests completed${NC}"
echo "========================================="
echo ""
echo "📝 Next steps:"
echo "1. Check the database for verification tokens"
echo "2. Manually verify email and SMS codes"
echo "3. Test password setup flow"
echo "4. Create UI pages for user-facing flows"
