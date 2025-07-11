import { Clock, BarChart2, Users, CheckCircle, ListChecks, CalendarCheck } from "lucide-react";

const Results = () => {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 font-poppins">
      {/* Hero Section */}
      <div className="relative w-full rounded-xl overflow-hidden mb-6 md:mb-10 bg-gradient-to-r from-green-700 to-green-500">
        <div className="absolute inset-0 bg-black/20 z-0" />
        <div
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: "url('/curved_line.png')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />

        <div className="relative z-0 flex flex-col md:flex-row items-center justify-between p-6 md:p-10">
          <div className="text-white max-w-xl mb-6 md:mb-0">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                <BarChart2 className="w-6 h-6" />
              </div>
              <div className="bg-yellow-500 text-white text-xs px-3 py-1 rounded-full font-semibold inline-flex items-center gap-1.5 shadow-sm">
                <Clock className="w-3.5 h-3.5" /> Coming Soon
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">Results – View Elections</h1>
            <p className="text-lg md:text-xl opacity-90 mb-4">
              Stay informed with real-time and historical election results. Track completed and ongoing elections across the nation.
            </p>
          </div>
        </div>
      </div>

      {/* Features Preview */}
      <div className="mb-12">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">What to Expect</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {features.map(feature => (
            <div key={feature.title} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center ${feature.bgColor}`}>
                  {feature.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-800">{feature.title}</h3>
                    {feature.source && (
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{feature.source}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="mb-12">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">How It Works</h2>
        <div className="relative">
          {/* Steps Connector */}
          <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-green-200 hidden sm:block"></div>
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-4 items-start relative">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex-shrink-0 flex items-center justify-center font-semibold shadow-md z-10">
                  {index + 1}
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex-1">
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coming Soon Banner */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between border border-green-200">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 flex items-center gap-2 mb-2">
            <Clock className="w-6 h-6 text-green-600" /> Launch Date
          </h2>
          <p className="text-gray-600 mb-4 md:mb-0">
            We're working hard to bring you this feature by <span className="font-semibold text-green-600">October 2025</span>. Stay tuned for updates!
          </p>
        </div>
        <button
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm flex items-center gap-2 self-start md:self-center"
          onClick={() => window.alert('Thanks for your interest! We\'ll notify you when this feature is available.')}
        >
          Get Notified
          <CheckCircle className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

const features = [
  {
    title: "Live Results",
    description: "Follow ongoing elections with real-time updates and visual charts.",
    icon: <BarChart2 className="text-green-600 h-6 w-6" />,
    bgColor: "bg-green-50",
    source: "INEC"
  },
  {
    title: "Historical Data",
    description: "Access past election results and trends for deeper insights.",
    icon: <CalendarCheck className="text-emerald-600 h-6 w-6" />,
    bgColor: "bg-emerald-50",
    source: "INEC"
  },
  {
    title: "Candidate Profiles",
    description: "Learn about candidates, their parties, and performance in elections.",
    icon: <Users className="text-lime-600 h-6 w-6" />,
    bgColor: "bg-lime-50",
    source: "New"
  },
  {
    title: "Verified Outcomes",
    description: "See certified results and official statements for transparency.",
    icon: <ListChecks className="text-green-700 h-6 w-6" />,
    bgColor: "bg-green-100",
    source: "Official"
  }
];

const steps = [
  {
    title: "Select an Election",
    description: "Choose from ongoing or completed elections to view detailed results."
  },
  {
    title: "View Live & Past Data",
    description: "Access real-time updates or explore historical election outcomes."
  },
  {
    title: "Explore Candidates",
    description: "See profiles, party affiliations, and performance of all candidates."
  },
  {
    title: "Verify Results",
    description: "Check official certifications and transparency statements."
  },
  {
    title: "Share Insights",
    description: "Easily share election results and insights with your community."
  }
];

export default Results;