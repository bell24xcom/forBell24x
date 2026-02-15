export const metadata = {
  title: 'Terms & Conditions | Bell24h',
}

export default function TermsPage() {
  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Terms & Conditions</h1>
      <div className="prose prose-slate max-w-none">
        <p>These Terms & Conditions govern the use of Bell24h. By using our services, you agree to these terms.</p>
        <h2>Use of Platform</h2>
        <p>Users agree to provide accurate information and comply with applicable laws. Transactions between buyers and suppliers are subject to mutually agreed terms.</p>
        <h2>Payments</h2>
        <p>Payments may be processed via Razorpay. All payment-related disputes are handled per our Refund & Cancellation policy.</p>
      </div>
    </main>
  )
}


