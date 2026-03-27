
// Force dynamic rendering
export const dynamic = 'force-dynamic';
export async function GET() {
  const reminders = [
    "Railway is still costing you ₹800/month",
    "You haven't sent a single WhatsApp message",
    "GST registration not started",
    "Zero customers contacted",
    "Zero revenue generated",
    "You're procrastinating instead of selling",
    "Your platform is ready - use it!",
    "Stop building features, start building customers"
  ];

  const wastedMoney = 800 * 7; // ₹800/month * 7 days
  const potentialRevenue = 10000; // What you could have earned

  return Response.json({
    message: "Stop building features. Start selling services.",
    wasted_so_far: `₹${wastedMoney}+ on Railway`,
    potential_revenue_lost: `₹${potentialRevenue}+ by not selling`,
    action_required: "SEND WHATSAPP MESSAGES NOW",
    reminders: reminders,
    next_action: "Go to railway.app and delete the project",
    revenue_target: "₹3,000 this week",
    current_revenue: "₹0",
    status: "PROCRASTINATING"
  });
}

