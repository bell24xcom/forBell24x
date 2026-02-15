export const metadata = {
  title: 'Privacy Policy | Bell24h',
}

export default function PrivacyPage() {
  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
      <div className="prose prose-slate max-w-none">
        <p>We respect your privacy. This policy explains what data we collect and how we use it.</p>
        <h2>Information We Collect</h2>
        <p>Contact details, business info, RFQ/quote data, and usage analytics to improve services.</p>
        <h2>Third-Party Processors</h2>
        <p>We use providers such as Razorpay for payments and MSG91 for OTP. Data is used solely to deliver services.</p>
      </div>
    </main>
  )
}


