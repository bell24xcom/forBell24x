// WhatsApp/Email outreach tracker
const outreachTargets = [
  {
    name: "Local textile business",
    phone: "+91-XXXXXXXXXX",
    message: "Supplier verification service - ₹2000",
    status: "pending",
    priority: "high"
  },
  {
    name: "Manufacturing company",
    phone: "+91-XXXXXXXXXX",
    message: "RFQ optimization - ₹500",
    status: "pending",
    priority: "high"
  },
  {
    name: "Construction company",
    phone: "+91-XXXXXXXXXX",
    message: "Featured supplier listing - ₹1000",
    status: "pending",
    priority: "medium"
  },
  {
    name: "Food processing unit",
    phone: "+91-XXXXXXXXXX",
    message: "Supplier verification service - ₹2000",
    status: "pending",
    priority: "high"
  },
  {
    name: "Electronics distributor",
    phone: "+91-XXXXXXXXXX",
    message: "RFQ writing service - ₹500",
    status: "pending",
    priority: "medium"
  }
];

// WhatsApp message templates
const messageTemplates = {
  verification: `Hello [Name],

I help B2B businesses verify suppliers before deals to avoid fraud and ensure quality.

Get a detailed verification report with:
✅ GST/PAN verification
✅ Business history check  
✅ Risk assessment score
✅ Contact verification
✅ Financial health check

₹2,000 only (GST extra)
48-hour delivery
Money-back guarantee

Interested? Reply YES`,

  rfq: `Hi [Name],

Need better responses to your RFQs?

I optimize your requirements to get:
✅ More supplier responses
✅ Better pricing quotes
✅ Clear specifications
✅ Professional presentation

₹500 per RFQ (GST extra)
24-hour delivery

Want to improve your next RFQ? Reply YES`,

  featured: `Hello [Name],

Want more visibility for your business?

Get featured on Bell24h marketplace:
✅ Top placement in search results
✅ Premium listing design
✅ Lead generation
✅ 30-day visibility

₹1,000 per month (GST extra)
Live within 24 hours

Want to boost your visibility? Reply YES`
};

// Track outreach progress
function trackOutreach() {
  console.log("🎯 Day 1 Outreach Targets:");
  console.log("==========================");

  outreachTargets.forEach((target, index) => {
    console.log(`${index + 1}. ${target.name}`);
    console.log(`   Phone: ${target.phone}`);
    console.log(`   Message: ${target.message}`);
    console.log(`   Priority: ${target.priority.toUpperCase()}`);
    console.log(`   Status: ${target.status}`);
    console.log("");
  });

  console.log("📱 WhatsApp Templates Ready:");
  console.log("===========================");
  console.log("1. Verification Service");
  console.log("2. RFQ Writing Service");
  console.log("3. Featured Listing Service");
  console.log("");

  console.log("🎯 Today's Goals:");
  console.log("================");
  console.log("• Send 10 WhatsApp messages");
  console.log("• Get 1 inquiry");
  console.log("• Send 1 quote");
  console.log("• Target: ₹500-2000 revenue");
}

// Follow-up sequence
const followUpSequence = [
  {
    day: 1,
    action: "Send initial message",
    template: "verification"
  },
  {
    day: 2,
    action: "Follow up if no response",
    template: "rfq"
  },
  {
    day: 3,
    action: "Call directly",
    template: "featured"
  }
];

// Export for use
module.exports = {
  outreachTargets,
  messageTemplates,
  followUpSequence,
  trackOutreach
};

// Run if called directly
if (require.main === module) {
  trackOutreach();
}
