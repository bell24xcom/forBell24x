import Stripe from 'stripe';

// Initialize Stripe with environment variables
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16', // Use the latest stable API version
  typescript: true,
});

// Export default for backward compatibility
export default stripe; 