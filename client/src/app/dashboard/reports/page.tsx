'use client';

export default function ReportsPage() {
  const reports = [
    {
      name: 'Monthly RFQ Performance',
      type: 'Performance',
      status: 'Ready',
      lastGenerated: '2 hours ago',
    },
    {
      name: 'Supplier Analytics Report',
      type: 'Analytics',
      status: 'Generating',
      lastGenerated: 'In progress',
    },
    { name: 'Market Trends Analysis', type: 'Market', status: 'Ready', lastGenerated: '1 day ago' },
    {
      name: 'Revenue & Growth Report',
      type: 'Financial',
      status: 'Scheduled',
      lastGenerated: 'Tomorrow',
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900 flex items-center'>
              <span>📄</span>
              Automated Reports & Analytics
            </h2>
            <p className='text-gray-600'>AI-powered business reports via Napkin.ai integration</p>
          </div>
          <div className='bg-green-50 rounded-lg p-4'>
            <div className='text-2xl font-bold text-green-600'>47</div>
            <div className='text-sm text-green-700'>Reports Generated</div>
          </div>
        </div>
      </div>
      {/* Quick Actions */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <button className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left'>
          <span>📈</span>
          <h3 className='font-semibold text-gray-900 mb-2'>Performance Report</h3>
          <p className='text-sm text-gray-600'>Generate RFQ and supplier performance analytics</p>
        </button>
        <button className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left'>
          <span>🥧</span>
          <h3 className='font-semibold text-gray-900 mb-2'>Market Analysis</h3>
          <p className='text-sm text-gray-600'>Comprehensive market trends and insights</p>
        </button>
        <button className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left'>
          <span>📊</span>
          <h3 className='font-semibold text-gray-900 mb-2'>Financial Summary</h3>
          <p className='text-sm text-gray-600'>Revenue, costs, and ROI analysis</p>
        </button>
      </div>
      {/* Report List */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-semibold text-gray-900'>Recent Reports</h3>
          <div className='flex space-x-2'>
            <button className='px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50'>
              <span>🔽</span>
              Filter
            </button>
            <button className='px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700'>
              Generate New
            </button>
          </div>
        </div>

        <div className='space-y-3'>
          {reports.map((report, index) => (
            <div key={index} className='border border-gray-200 rounded-lg p-4 hover:bg-gray-50'>
              <div className='flex justify-between items-center'>
                <div className='flex items-center space-x-3'>
                  <span>📄</span>
                  <div>
                    <h4 className='font-medium text-gray-900'>{report.name}</h4>
                    <p className='text-sm text-gray-500'>
                      {report.type} • {report.lastGenerated}
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      report.status === 'Ready'
                        ? 'bg-green-100 text-green-800'
                        : report.status === 'Generating'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {report.status}
                  </span>
                  {report.status === 'Ready' && (
                    <button className='text-blue-600 hover:text-blue-800'>
                      <span>⬇️</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Napkin.ai Integration */}
      <div className='bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>Napkin.ai Integration</h3>
            <p className='text-gray-600 mb-3'>
              Automated business intelligence and report generation
            </p>
            <ul className='text-sm text-gray-700 space-y-1'>
              <li>• AI-powered data analysis and insights</li>
              <li>• Automated report scheduling and delivery</li>
              <li>• Custom report templates and formats</li>
              <li>• Real-time data visualization</li>
            </ul>
          </div>
          <div className='text-green-600'>
            <span>📄</span>
            <p className='text-sm font-medium mt-1'>Integration Ready</p>
          </div>
        </div>
      </div>
    </div>
  );
}
