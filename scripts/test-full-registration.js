#!/usr/bin/env node

const testRegistration = async () => {
  const baseUrl = 'http://localhost:3000'

  console.log('🧪 Testing Full Registration Flow')
  console.log('==================================\n')

  // Test data
  const testData = {
    firstName: 'Erwan',
    lastName: 'Lefak',
    email: 'erwan.lefak@gmail.com',
    phone: '+237659690099',
    city: 'Douala',
    howDidYouFindUs: 'social_media',
    acceptCGV: true
  }

  try {
    // Step 1: Register
    console.log('📝 Step 1: Creating account...')
    const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    })

    const registerData = await registerResponse.json()

    if (!registerResponse.ok) {
      console.error('❌ Registration failed:', registerData)
      return
    }

    console.log('✅ Registration successful!')
    console.log('📧 Email sent to:', testData.email)
    console.log('📱 SMS sent to:', testData.phone)
    console.log('🆔 Customer ID:', registerData.data.customerId)
    console.log('\n📋 Next steps:')
    registerData.data.nextSteps.forEach(step => console.log(`   ${step}`))

    console.log('\n' + '='.repeat(50))
    console.log('✅ Test completed successfully!')
    console.log('='.repeat(50))
    console.log('\n🔍 Check your email for the verification link!')
    console.log('📱 Check your phone for the SMS verification code!')

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testRegistration()
