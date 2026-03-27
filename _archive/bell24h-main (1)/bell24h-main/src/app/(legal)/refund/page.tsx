export const metadata = {
  title: 'Refund & Cancellation | Bell24h',
}

export default function RefundPage() {
  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Refund & Cancellation</h1>
      <div className="prose prose-slate max-w-none">
        <p>Refunds and cancellations are handled as per the agreement between buyer and supplier. Platform fees (if any) are non-refundable unless a duplicate charge occurs.</p>
        <h2>Payment Gateway</h2>
        <p>Payments processed via Razorpay follow RBI and card network guidelines. For charge disputes, contact us at support@bell24h.com.</p>
      </div>
    </main>
  )
}


