import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  const svixId = request.headers.get('svix-id');
  const svixTimestamp = request.headers.get('svix-timestamp');
  const svixSignature = request.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    console.error('RESEND_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  let event: any;
try {
    console.log('Verifying webhook signature...');
    console.log('Raw body:', rawBody);
    console.log('Headers:', { svixId, svixTimestamp, svixSignature });
    const wh = new Webhook(secret);
    event = wh.verify(rawBody, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
    console.log('Signature verification successful');
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    console.error('Raw body:', rawBody);
    console.error('Headers:', { svixId, svixTimestamp, svixSignature });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const { type, data } = event;
  console.log(`Resend webhook received: ${type}`, data);

  try {
    switch (type) {
      case 'email.bounced': {
        if (data.to?.[0]) {
          await prisma.user.updateMany({
            where: { email: data.to[0] },
            data: { isActive: false },
          });
        }
        break;
      }
      case 'email.delivered':
      case 'email.sent':
      case 'email.opened':
      case 'email.clicked':
      case 'email.complained':
      case 'contact.created':
      case 'contact.deleted':
      default:
        // Log event for future use
        break;
    }
  } catch (err) {
    console.error(`Error handling webhook event ${type}:`, err);
  }

  return NextResponse.json({ received: true });
}