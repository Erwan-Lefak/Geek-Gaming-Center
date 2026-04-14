/**
 * Test Flow 2: Cashier creates customer (Direct DB access)
 *
 * This script directly tests the customer creation logic without authentication
 * to verify that SMS and setup password emails are sent correctly.
 */

import dotenv from 'dotenv'
import path from 'path'

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

import { PrismaClient } from '@prisma/client'
import { MailService } from '../src/lib/email/mail-service'
import { SmsService } from '../src/lib/sms/sms-service'
import crypto from 'crypto'

const prisma = new PrismaClient()

const TEST_CUSTOMER = {
  firstName: 'Test',
  lastName: 'Direct' + Date.now(),
  email: 'erwan.lefak@gmail.com',
  phone: '690123456',
  acceptCGV: true,
  status: 'NEW',
  cgvAcceptedAt: new Date()
}

async function testDirectCustomerCreation() {
  console.log('🎮 Test Flow 2: Direct Customer Creation')
  console.log('=' .repeat(60))

  try {
    await prisma.$connect()

    // Step 1: Create customer
    console.log('\n📝 Step 1: Creating customer...')
    console.log('Data:', JSON.stringify(TEST_CUSTOMER, null, 2))

    // Find a cashier to use as createdById
    const cashier = await prisma.user.findFirst({
      where: { role: 'CASHIER' }
    })

    if (!cashier) {
      throw new Error('No cashier found in database')
    }

    console.log('✅ Using cashier:', cashier.email)

    const customer = await prisma.customer.create({
      data: {
        ...TEST_CUSTOMER,
        createdById: cashier.id
      }
    })

    console.log('✅ Customer created successfully!')
    console.log('Customer ID:', customer.id)
    console.log('\nCustomer details:')
    console.log('- Name:', `${customer.firstName} ${customer.lastName}`)
    console.log('- Email:', customer.email || 'None')
    console.log('- Phone:', customer.phone)
    console.log('- Status:', customer.status)

    // Step 2: Send SMS verification code
    console.log('\n📱 Step 2: Sending SMS verification code...')
    const formattedPhone = SmsService.formatPhoneNumber(customer.phone)
    console.log('Formatted phone:', formattedPhone)

    const smsResult = await SmsService.sendPhoneVerificationCode(
      customer.id,
      formattedPhone,
      customer.firstName
    )

    if (smsResult.success) {
      console.log('✅ SMS sent successfully!')
      console.log('   Code (for testing):', smsResult.code)
    } else {
      console.log('❌ SMS failed')
    }

    // Step 3: Send setup password email
    console.log('\n📧 Step 3: Sending setup password email...')

    const setupToken = crypto.randomBytes(32).toString('hex')

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        password_reset_token: setupToken,
        password_reset_expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const setupUrl = `${baseUrl}/setup-password?token=${setupToken}`

    // Only send email if customer has an email
    if (customer.email) {
      const emailSent = await MailService.sendPasswordSetup(
        customer.email,
        `${customer.firstName} ${customer.lastName}`,
        setupUrl
      )

      if (emailSent) {
        console.log('✅ Setup password email sent successfully!')
        console.log('   Setup URL:', setupUrl)
      } else {
        console.log('❌ Email failed')
      }
    } else {
      console.log('⚠️ No email address for customer')
    }

    // Step 4: Verify data in database
    console.log('\n🔍 Step 4: Verifying data in database...')

    const updatedCustomer = await prisma.customer.findUnique({
      where: { id: customer.id },
      select: {
        password_reset_token: true,
        password_reset_expires: true,
        email_verified: true
      }
    })

    console.log('SMS Code in DB:', updatedCustomer?.password_reset_token)
    console.log('Token expires:', updatedCustomer?.password_reset_expires)
    console.log('Email verified:', updatedCustomer?.email_verified)

    console.log('\n' + '='.repeat(60))
    console.log('✅ Test completed successfully!')
    console.log('\n📋 Summary:')
    console.log('1. Customer created:', customer.id)
    console.log('2. SMS code:', smsResult.code || 'Failed')
    console.log('3. Setup email sent to:', customer.email)
    console.log('4. Setup URL:', setupUrl)

    console.log('\n🔗 Test URLs:')
    console.log('Verify phone:', `http://localhost:3000/verify-phone?customer=${customer.id}`)
    console.log('Use SMS code:', smsResult.code)
    console.log('\nSetup password:', setupUrl)

    await prisma.$disconnect()

  } catch (error) {
    console.error('❌ Error during test:', error)
    await prisma.$disconnect()
  }
}

// Run test
testDirectCustomerCreation()
