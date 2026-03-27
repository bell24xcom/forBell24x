// app/components/ComingSoonBanner.tsx - Coming Soon Banner Component
interface ComingSoonBannerProps {
  title?: string;
  description?: string;
  features?: string[];
  className?: string;
}

export default function ComingSoonBanner({
  title = "Feature Coming Soon",
  description = "We're working hard to bring you this amazing feature!",
  features = [],
  className = ""
}: ComingSoonBannerProps) {
  return (
    <div className={`w-full p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white ${className}`}>
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="text-blue-100 mb-4">{description}</p>
        </div>

        {features.length > 0 && (
          <div className="text-left bg-white bg-opacity-10 rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-2">What's Coming:</h3>
            <ul className="space-y-1">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm">
                  <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-sm text-blue-100">
          🚀 Stay tuned for updates!
        </div>
      </div>
    </div>
  );
}
