import { ShieldCheck, Eye, FileText, Users, KeyRound } from "lucide-react";
import MonitorCTA from "./monitor/components/MonitorCTA";
import { useState } from "react";
import Toast from "../../../components/Toast";

const Monitor = () => {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

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
                Vote Protection
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">Election Monitoring Center</h1>
            <p className="text-lg md:text-xl opacity-90 mb-4">
              Access your monitoring dashboard or register to become a trained Vote Protection Officer.
            </p>
          </div>
        </div>
      </div>

      {/* Monitoring Access Section - Primary Action */}
      <div className="bg-white border border-green-200 rounded-xl p-8 mb-12 shadow-lg">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="bg-green-100 p-3 rounded-full">
              <KeyRound className="text-green-700 w-8 h-8" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Vote Protection Officer Access</h2>
          </div>

          <p className="text-gray-600 mb-8 text-lg">
            Access the election monitoring dashboard to submit real-time reports and monitor election activities in your assigned location.
          </p>

          <button
            onClick={() => window.open('/dashboard/elections/monitoring', '_blank')}
            className="bg-green-700 text-white px-12 py-4 rounded-lg hover:bg-green-800 transition font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
          >
            🚀 Open Monitoring Dashboard
          </button>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> The monitoring dashboard will open in a new tab and has its own secure authentication system.
            </p>
          </div>
        </div>
      </div>

      {/* Volunteer Registration Section */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Become a Vote Protection Officer</h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Join the Citizens Organizing School and get trained to monitor elections in your polling unit.
            Help protect democracy and ensure free, fair elections.
          </p>
        </div>
        <MonitorCTA />
      </div>

      {/* Features Preview */}
      <div className="mb-12">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">What You'll Get as a Vote Protection Officer</h2>
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

      {/* Toast Message */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

const features = [
  {
    title: "Comprehensive Training",
    description: "Receive professional training on election monitoring, legal procedures, and incident reporting.",
    icon: <Users className="text-green-600 h-6 w-6" />,
    bgColor: "bg-green-50"
  },
  {
    title: "Secure Monitoring Dashboard",
    description: "Access your personalized dashboard with your unique key to submit real-time election updates.",
    icon: <KeyRound className="text-green-700 h-6 w-6" />,
    bgColor: "bg-green-100"
  },
  {
    title: "Live Election Monitoring",
    description: "Monitor voting processes and report incidents directly from your assigned polling unit.",
    icon: <Eye className="text-emerald-600 h-6 w-6" />,
    bgColor: "bg-emerald-50"
  },
  {
    title: "Incident Reporting Tools",
    description: "Easy-to-use forms for documenting and reporting any irregularities or issues observed.",
    icon: <FileText className="text-lime-600 h-6 w-6" />,
    bgColor: "bg-lime-50"
  }
];

const steps = [
  {
    title: "Register for the Citizens Organizing School",
    description: "Fill out the registration form to join our comprehensive training program for Vote Protection Officers."
  },
  {
    title: "Complete Professional Training",
    description: "Attend training sessions covering election law, monitoring procedures, and incident documentation."
  },
  {
    title: "Receive Your Monitoring Access",
    description: "Get your monitoring credentials and access instructions for your designated polling unit."
  },
  {
    title: "Access Monitoring Dashboard",
    description: "Use the monitoring dashboard on election day to submit real-time reports and protect democracy."
  }
];

export default Monitor;