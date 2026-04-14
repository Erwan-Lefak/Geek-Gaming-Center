/**
 * Test Flow 2: Cashier creates customer
 *
 * This script simulates the cashier creating a customer in the dashboard.
 * It should trigger:
 * 1. Login as cashier
 * 2. Customer creation (without password)
 * 3. SMS verification code sent
 * 4. Setup password email sent
 */

const CASHIER_CREDENTIALS = {
  email: 'caissiere@ggc.cm',
  password: 'Test1234!'
}

const TEST_CUSTOMER = {
  firstName: 'Test',
  lastName: 'Cashier' + Date.now(),
  email: 'erwan.lefak@gmail.com',
  phone: '690123456',
  acceptTerms: true
}

let authToken = null

async function login() {
  console.log('🔐 Logging in as cashier...')

  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(CASHIER_CREDENTIALS)
  })

  const data = await response.json()

  console.log('Response status:', response.status)
  console.log('Response data:', JSON.stringify(data, null, 2))

  if (!response.ok) {
    throw new Error('Login failed: ' + (data.error || 'Unknown error'))
  }

  // Get session token from cookies
  const setCookie = response.headers.get('set-cookie')
  console.log('Set-Cookie header:', setCookie)

  if (setCookie) {
    const match = setCookie.match(/authjs\.session-token=([^;]+)/)
    if (match) {
      authToken = match[1]
      console.log('✅ Logged in successfully')
      console.log('Auth token:', authToken.substring(0, 20) + '...')
      return
    }
  }

  throw new Error('No session token found')
}

async function testCashierFlow() {
  console.log('🎮 Test Flow 2: Cashier creates customer')
  console.log('=' .repeat(60))

  try {
    // Step 0: Login as cashier
    await login()

    // Step 1: Create customer as cashier would
    console.log('\n📝 Step 1: Creating customer via API...')
    console.log('Data:', JSON.stringify(TEST_CUSTOMER, null, 2))

    const response = await fetch('http://localhost:3000/api/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `authjs.session-token=${authToken}`
      },
      body: JSON.stringify(TEST_CUSTOMER)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Failed to create customer:', data)
      return
    }

    console.log('✅ Customer created successfully!')
    console.log('Customer ID:', data.id)
    console.log('Message:', data.message)
    console.log('\nCustomer details:')
    console.log('- Name:', `${data.firstName} ${data.lastName}`)
    console.log('- Email:', data.email || 'None')
    console.log('- Phone:', data.phone)
    console.log('- Status:', data.status)

    // Check what was sent
    console.log('\n📤 What should have been sent:')
    console.log('1. 📱 SMS verification code to:', data.phone)
    console.log('2. 📧 Setup password email to:', data.email || 'None')

    // Get verification code from database (for testing)
    console.log('\n🔍 Fetching SMS code from database...')

    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    const customer = await prisma.customer.findUnique({
      where: { id: data.id },
      select: {
        password_reset_token: true,
        password_reset_expires: true,
        emailVerified: true
      }
    })

    await prisma.$disconnect()

    if (customer && customer.password_reset_token) {
      console.log('✅ SMS Code found in database:', customer.password_reset_token)
      console.log('   Expires:', customer.password_reset_expires)

      console.log('\n📱 To verify phone, visit:')
      console.log(`http://localhost:3000/verify-phone?customer=${data.id}`)
      console.log(`   Use code: ${customer.password_reset_token}`)
    } else {
      console.log('❌ No SMS code found in database')
    }

    if (customer && data.email) {
      console.log('\n📧 Setup password email should contain:')
      console.log('   Subject: Crée ton mot de passe - Geek Gaming Center')
      console.log('   Link: http://localhost:3000/setup-password?token=<token>')
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ Test completed!')
    console.log('\nNext steps:')
    console.log('1. Check your email for the setup password link')
    console.log('2. Check the SMS code in console above')
    console.log('3. Visit /verify-phone with the customer ID and code')
    console.log('4. Visit /setup-password with the token from email')

  } catch (error) {
    console.error('❌ Error during test:', error)
  }
}

// Run test
testCashierFlow()
