export default function SalesDashboard() {
  const todaysTasks = [
    { task: "Shut down Railway", status: "URGENT", value: "₹800/month saved", completed: false },
    { task: "Send 10 WhatsApp messages", status: "PENDING", value: "₹2000 potential", completed: false },
    { task: "Apply for GST", status: "PENDING", value: "Legal requirement", completed: false },
    { task: "Make 5 phone calls", status: "PENDING", value: "₹1000 potential", completed: false },
    { task: "Post in 3 business groups", status: "PENDING", value: "₹500 potential", completed: false }
  ];

  const revenueStats = {
    current: 0,
    target: 3000,
    wasted: 800,
    daysWasted: 7
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-red-600">🚨 STOP BUILDING, START SELLING</h1>

      <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded mb-6">
        <p className="font-bold text-lg">⚠️ Railway still running - losing ₹26.67/day</p>
        <p className="text-sm">Total wasted so far: ₹{revenueStats.wasted * revenueStats.daysWasted}</p>
        <a
          href="https://railway.app"
          className="text-blue-600 underline font-bold text-lg"
          target="_blank"
          rel="noopener noreferrer"
        >
          SHUT IT DOWN NOW →
        </a>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-yellow-100 p-4 rounded">
          <h2 className="font-bold text-lg">Revenue Status</h2>
          <p className="text-2xl font-bold text-red-600">₹{revenueStats.current}</p>
          <p className="text-sm">Target: ₹{revenueStats.target}</p>
          <p className="text-sm">Days wasted: {revenueStats.daysWasted}</p>
        </div>

        <div className="bg-green-100 p-4 rounded">
          <h2 className="font-bold text-lg">Potential Revenue</h2>
          <p className="text-2xl font-bold text-green-600">₹5,500</p>
          <p className="text-sm">If you take action today</p>
          <p className="text-sm">Stop procrastinating!</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Today's Revenue Actions</h2>
      <div className="space-y-3">
        {todaysTasks.map((task, index) => (
          <div key={index} className="border p-4 rounded bg-white shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-3 w-5 h-5"
                  disabled
                />
                <span className="font-medium">{task.task}</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${task.status === 'URGENT' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {task.status}
                </span>
              </div>
              <span className="text-green-600 font-bold">{task.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-red-50 border border-red-200 p-6 rounded">
        <h2 className="text-xl font-bold text-red-800 mb-4">🔥 THE HARD TRUTH</h2>
        <ul className="space-y-2 text-red-700">
          <li>✅ You have 52+ pages deployed</li>
          <li>✅ You have 9 admin panels</li>
          <li>✅ You have 3 service offerings</li>
          <li>✅ You have payment integration</li>
          <li>✅ You have legal documents</li>
          <li>✅ You have marketing templates</li>
          <li>❌ You have ₹0 revenue</li>
          <li>❌ You have 0 customers</li>
          <li>❌ You have 0 testimonials</li>
          <li>❌ You're still wasting ₹800/month on Railway</li>
        </ul>
      </div>

      <div className="mt-6 bg-yellow-100 p-4 rounded">
        <h3 className="font-bold text-lg">⚡ IMMEDIATE ACTIONS (Not More Code)</h3>
        <div className="mt-3 space-y-2">
          <p><strong>RIGHT NOW (Next 5 Minutes):</strong></p>
          <p>1. Go to railway.app</p>
          <p>2. Delete bell24h project</p>
          <p>3. Save ₹800/month</p>

          <p className="mt-4"><strong>NEXT 30 MINUTES:</strong></p>
          <p>1. Open WhatsApp</p>
          <p>2. Send this message to 10 contacts:</p>
          <div className="bg-white p-3 rounded mt-2 font-mono text-sm">
            Hi [Name], I'm offering supplier verification reports for ₹2000.
            Helps avoid fraud in B2B deals. Interested?
          </div>
        </div>
      </div>

      <div className="mt-6 bg-green-100 p-4 rounded">
        <h3 className="font-bold text-lg">🎯 STOP ASKING FOR PROMPTS</h3>
        <p>You don't need more code. You need:</p>
        <ul className="mt-2 space-y-1">
          <li>• <strong>Customers</strong> (send messages)</li>
          <li>• <strong>Revenue</strong> (close deals)</li>
          <li>• <strong>Action</strong> (stop procrastinating)</li>
        </ul>
        <p className="mt-3 font-bold text-red-600">
          Next prompt should be: "I shut down Railway and got my first customer"
        </p>
        <p className="text-red-600">
          Not: "Give me another feature to build"
        </p>
      </div>
    </div>
  );
}

