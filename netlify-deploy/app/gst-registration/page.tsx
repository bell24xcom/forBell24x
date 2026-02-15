export default function GSTRegistrationGuide() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">GST Registration Status</h1>

      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
        <p className="font-bold">⚠️ IMPORTANT: Cannot legally take B2B payments without GST</p>
      </div>

      <h2 className="text-xl font-semibold mb-3">Documents Required:</h2>
      <ul className="list-disc pl-6 mb-6">
        <li>PAN Card</li>
        <li>Aadhaar Card</li>
        <li>Bank Account Details</li>
        <li>Address Proof</li>
        <li>Photograph</li>
        <li>Digital Signature (DSC)</li>
      </ul>

      <h2 className="text-xl font-semibold mb-3">Process:</h2>
      <ol className="list-decimal pl-6 mb-6">
        <li>Apply at gst.gov.in (₹0 fees)</li>
        <li>Fill Form GST REG-01</li>
        <li>Submit documents</li>
        <li>Verification (15 days)</li>
        <li>Receive GSTIN</li>
      </ol>

      <h2 className="text-xl font-semibold mb-3">Alternative: GST Consultant</h2>
      <p>Cost: ₹3,000-5,000 | Time: 7-10 days</p>

      <div className="bg-red-100 border-l-4 border-red-500 p-4 mt-6">
        <p className="font-bold">Penalty for non-compliance: ₹10,000-25,000</p>
      </div>

      <div className="bg-green-100 border-l-4 border-green-500 p-4 mt-6">
        <h3 className="font-bold">Quick Start Option:</h3>
        <p>Start with personal UPI payments until GST is ready. Update customers that GST invoice will be provided once registered.</p>
      </div>
    </div>
  );
}
