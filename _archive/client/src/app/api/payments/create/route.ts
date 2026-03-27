import { NextRequest, NextResponse } from 'next/server'
// NextAuth removed - using mobile OTP authentication
import { rateLimit } from '@/lib/rate-limit'
import { createRazorpayOrder, createStripePaymentIntent } from '@/lib/payment'
import { z } from 'zod'

// Validation schema
const CreatePaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  amount: z.number().min(1, 'Amount must be greater than 0'),
  currency: z.string().default('INR'),
  description: z.string().optional(),
  customerId: z.string().min(1, 'Customer ID is required'),
  customerEmail: z.string().email('Valid email is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  paymentMethod: z.enum(['razorpay', 'stripe']).default('razorpay'),
  enableEscrow: z.boolean().default(true),
})

/**
 * POST /api/payments/create - Create payment order with escrow
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const { allowed, response } = await rateLimit(request, { windowMs: 60000, max: 5 })
    if (!allowed) return response!

    // Check authentication
    // Check authentication (simplified for mobile OTP)
    // TODO: Implement proper mobile OTP authentication check

    // Parse and validate request body
    const body = await request.json()
    const validatedData = CreatePaymentSchema.parse(body)

    const {
      orderId,
      amount,
      currency,
      description,
      customerId,
      customerEmail,
      customerName,
      paymentMethod,
      enableEscrow,
    } = validatedData

    let paymentOrder

    try {
      // Create payment order based on selected method
      if (paymentMethod === 'razorpay') {
        paymentOrder = await createRazorpayOrder(
          amount,
          currency,
          orderId,
          customerId,
          customerEmail,
          customerName
        )
      } else if (paymentMethod === 'stripe') {
        paymentOrder = await createStripePaymentIntent(
          amount,
          currency,
          orderId,
          customerId,
          customerEmail
        )
      } else {
        return NextResponse.json(
          { error: 'Unsupported payment method' },
          { status: 400 }
        )
      }

      if (!paymentOrder.success) {
        return NextResponse.json(
          { error: 'Failed to create payment order' },
          { status: 500 }
        )
      }

      // Log payment creation
      console.log(`Payment order created: ${orderId}`)

      return NextResponse.json({
        success: true,
        paymentOrder,
        escrowEnabled: enableEscrow,
        message: 'Payment order created successfully',
        timestamp: new Date().toISOString(),
      })

    } catch (error) {
      console.error('Payment creation error:', error)
      
      return NextResponse.json(
        { 
          error: 'Payment creation failed',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Payment API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
