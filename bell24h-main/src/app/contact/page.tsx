export const metadata = {
  title: 'Contact Us | Bell24h',
}

export default function ContactPage() {
  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
      <div className="space-y-2">
        <p>Email: <a href="mailto:support@bell24h.com" className="text-blue-600">support@bell24h.com</a></p>
        <p>Phone: <a href="tel:+918888888888" className="text-blue-600">+91 88888 88888</a></p>
        <p>Address: Mumbai, Maharashtra, India</p>
      </div>
    </main>
  )
}


