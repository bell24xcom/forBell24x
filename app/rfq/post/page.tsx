export default function PostRFQPage() {
  return (
    <div className="page-container flex items-center justify-center">
      <div className="text-center">
        <h1 className="page-title">Post Your RFQ</h1>
        <p className="page-subtitle mb-8">Create your request for quotation</p>
        <a 
          href="/rfq/create" 
          className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors inline-block"
        >
          Go to RFQ Creation
        </a>
      </div>
    </div>
  );
}
