import { ShieldCheck, Eye, FileText, Users, KeyRound } from "lucide-react";
import MonitorCTA from "./monitor/components/MonitorCTA";
import { useState } from "react";

const Monitor = () => {
  const [uniqueKey, setUniqueKey] = useState("");

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
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-6 md:p-10">
          <div className="text-white max-w-xl mb-6 md:mb-0">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="bg-yellow-500 text-white text-xs px-3 py-1 rounded-full font-semibold inline-flex items-center gap-1.5 shadow-sm">
                Monitor
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">Monitor – Vote Protection Officer</h1>
            <p className="text-lg md:text-xl opacity-90 mb-4">
              Become a trained Vote Protection Officer and monitor live elections in your polling unit. Submit real-time information and help protect the vote.
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

      {/* CTA Section */}
      <div className="mb-12">
        <MonitorCTA />
      </div>

      {/* Unique Key Submission */}
      <div className="bg-white border border-green-200 rounded-xl p-6 max-w-xl mx-auto shadow-sm flex flex-col items-center">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="text-green-700" />
          <h3 className="text-lg font-semibold text-gray-800">Submit Your Unique Key</h3>
        </div>
        <p className="text-gray-600 mb-4 text-center">If you have received a unique key as a Vote Protection Officer, enter it below to access your reporting dashboard.</p>
        <form className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <input
            type="text"
            placeholder="Enter your unique key"
            value={uniqueKey}
            onChange={e => setUniqueKey(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition"
            disabled
            title="Feature coming soon"
          >
            Submit
          </button>
        </form>
        <span className="text-xs text-yellow-700 mt-2">This feature will be available soon.</span>
      </div>
    </div>
  );
};

const features = [
  {
    title: "Vote Protection Training",
    description: "Get trained to monitor elections and protect the integrity of the vote in your polling unit.",
    icon: <Users className="text-green-600 h-6 w-6" />,
    bgColor: "bg-green-50"
  },
  {
    title: "Live Election Monitoring",
    description: "Report incidents and submit real-time updates from your polling unit.",
    icon: <Eye className="text-emerald-600 h-6 w-6" />,
    bgColor: "bg-emerald-50"
  },
  {
    title: "Incident Reporting",
    description: "Easily file reports on any irregularities or issues you observe during the election.",
    icon: <FileText className="text-lime-600 h-6 w-6" />,
    bgColor: "bg-lime-50"
  },
  {
    title: "Secure Access",
    description: "Use your unique key to access the reporting dashboard and submit information securely.",
    icon: <KeyRound className="text-green-700 h-6 w-6" />,
    bgColor: "bg-green-100"
  }
];

const steps = [
  {
    title: "Register as a Vote Protection Officer",
    description: "Fill out the registration form to join the Citizens Organizing School and receive training."
  },
  {
    title: "Get Trained & Receive Unique Key",
    description: "Complete your training and receive a unique key for secure access to the reporting dashboard."
  },
  {
    title: "Monitor & Report",
    description: "On election day, use your dashboard to submit live updates and incident reports from your polling unit."
  },
  {
    title: "Help Protect Democracy",
    description: "Your participation helps ensure free, fair, and credible elections for all."
  }
];

export default Monitor;