import {
  Users, CheckCircle, Award, Calendar,
  Target, GraduationCap, ChevronDown,
  MoveRight, School, BarChart3, Shield
} from "lucide-react";
import { useState } from "react";

const CitizensOrganizingSchool = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>("vision");

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const airtableFormUrl = "https://airtable.com/apppzNRujCOPHOs94/shrGd9vibDWpPOCWj";

  return (
    <div className="font-poppins py-20 ">

      <div className="mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-800">
          Welcome to the Obidient Citizens Organising School
        </h2>

        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg text-gray-700 mb-8">
            We are building an army of 5 million organisers, everyday Nigerians equipped with the skills, tools, and strategy to fix what's broken in their communities and protect Nigeria's democracy.
          </p>
        </div>
        <div className="max-w-4xl mx-auto text-center">
          <a
            href={airtableFormUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#006837] text-white rounded-full text-lg font-semibold hover:bg-green-800 transition-all shadow-lg"
          >
            Apply Now – Start Your Training <MoveRight className="w-5 h-5" />
          </a>
        </div>

      </div>

      {/* Summary Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center border-t-4 border-[#006837]">
          <div className="w-14 h-14 rounded-full bg-[#006837]/10 flex items-center justify-center mb-4">
            <School className="w-7 h-7 text-[#006837]" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Train</h3>
          <p className="text-gray-600">Build essential organizing skills and civic leadership</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center border-t-4 border-[#006837]">
          <div className="w-14 h-14 rounded-full bg-[#006837]/10 flex items-center justify-center mb-4">
            <Users className="w-7 h-7 text-[#006837]" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Mobilise</h3>
          <p className="text-gray-600">Activate communities for elections and issue campaigns</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center border-t-4 border-[#006837]">
          <div className="w-14 h-14 rounded-full bg-[#006837]/10 flex items-center justify-center mb-4">
            <Shield className="w-7 h-7 text-[#006837]" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Protect</h3>
          <p className="text-gray-600">Safeguard democracy through election monitoring and litigation</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center border-t-4 border-[#006837]">
          <div className="w-14 h-14 rounded-full bg-[#006837]/10 flex items-center justify-center mb-4">
            <Target className="w-7 h-7 text-[#006837]" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Transform</h3>
          <p className="text-gray-600">Create lasting impact in your community and country</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Welcome Section */}


        {/* Expandable Sections */}
        <div className="space-y-6 mb-16">
          {/* Vision Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <button
              className="w-full flex justify-between items-center p-6 text-left"
              onClick={() => toggleSection("vision")}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Why You Must Apply</h3>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${expandedSection === "vision" ? "transform rotate-180" : ""}`} />
            </button>

            {expandedSection === "vision" && (
              <div className="px-6 pb-6">
                <p className="text-gray-700 mb-4 font-medium">The system won't fix itself. Politicians won't save us. Only organised citizens can lead the change we need.</p>
                <p className="text-gray-700 mb-4">Join if you're ready to:</p>
                <ul className="space-y-3">
                  {[
                    "Mobilise voters for reform and accountability",
                    "Lead issue-based campaigns that matter",
                    "Protect votes and gather evidence for litigation",
                    "Hold your leaders accountable — from ward to presidency",
                    "Spark movements in your community that change lives"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#006837] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-gray-700 mt-4 font-medium">We're not training spectators. We're building organisers who will win battles for the soul of this nation.</p>
              </div>
            )}
          </div>

          {/* Platform Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <button
              className="w-full flex justify-between items-center p-6 text-left"
              onClick={() => toggleSection("platform")}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Powered by the Obidient Movement Platform</h3>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${expandedSection === "platform" ? "transform rotate-180" : ""}`} />
            </button>

            {expandedSection === "platform" && (
              <div className="px-6 pb-6">
                <p className="text-gray-700 mb-4">Every participant will be trained to use the Obidient Movement digital platform, your one-stop civic tech toolkit to:</p>
                <ul className="space-y-3">
                  {[
                    "Launch and manage issue-based campaigns or Political Campaigns for Values-based Candidates.",
                    "Mobilise PVC-holding voters in your area.",
                    "Report corruption, failed projects, and community issues via photo, voice or SMS.",
                    "Monitor elections and upload evidence for legal and media use.",
                    "Track elected officials and demand action."
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-gray-700 mt-4">This platform gives you real-time tools to organise smarter, faster, and more powerfully and you'll leave the school knowing exactly how to use it.</p>
              </div>
            )}
          </div>

          {/* Journey Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <button
              className="w-full flex justify-between items-center p-6 text-left"
              onClick={() => toggleSection("journey")}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Your Journey at Obidient Citizens Organising School</h3>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${expandedSection === "journey" ? "transform rotate-180" : ""}`} />
            </button>

            {expandedSection === "journey" && (
              <div className="px-6 pb-6">
                <div className="space-y-8">
                  {/* Bootcamp */}
                  <div>
                    <h4 className="text-lg font-semibold text-[#006837] mb-2">5-Day Core Bootcamp – The Essentials</h4>
                    <p className="text-gray-700 mb-2">Your foundation in grassroots power. You'll learn:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[
                        "Community organising strategy",
                        "Mobilisation planning",
                        "Digital organising tools",
                        "Voter engagement & PVC activation",
                        "Election monitoring and evidence collection",
                        "Vote protection and litigation support",
                        "Full walkthrough and application of the Obidient Movement Platform"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-[#006837] flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Elective Courses */}
                  <div>
                    <h4 className="text-lg font-semibold text-purple-600 mb-2">Elective Courses – Deepen Your Mission</h4>
                    <p className="text-gray-700 mb-2">Pick your passion. Choose from focus areas like:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[
                        "Anti-corruption & budget tracking",
                        "Party reform & political strategy",
                        "Gender, youth, and inclusion organising",
                        "Election Observation, Vote protection & Electoral Litigation Support"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Masterclasses */}
                  <div>
                    <h4 className="text-lg font-semibold text-blue-600 mb-2">Masterclasses – Learn from Experts</h4>
                    <p className="text-gray-700 mb-2">High-impact sessions with Nigeria's leading voices in:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[
                        "Civic technology",
                        "Electoral law",
                        "Movement building",
                        "Storytelling for advocacy",
                        "Legal frameworks for electoral justice"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Workshops */}
                  <div>
                    <h4 className="text-lg font-semibold text-amber-600 mb-2">Workshops – Build Your Campaign</h4>
                    <p className="text-gray-700 mb-2">Roll up your sleeves. Design, test, and deploy your campaign strategy:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[
                        "Map your community's problems",
                        "Build a local organiser network",
                        "Simulate election day monitoring",
                        "Create digital mobilisation assets",
                        "Run accountability actions with real impact"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Format Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <button
              className="w-full flex justify-between items-center p-6 text-left"
              onClick={() => toggleSection("format")}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Flexible Class Formats – Learn Your Way</h3>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${expandedSection === "format" ? "transform rotate-180" : ""}`} />
            </button>

            {expandedSection === "format" && (
              <div className="px-6 pb-6">
                <p className="text-gray-700 mb-4">To reach every organiser, wherever they are training is delivered through:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Online Sessions</h4>
                    <p className="text-sm text-gray-700">Join from anywhere in Nigeria or the diaspora</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">In-Person Cohorts</h4>
                    <p className="text-sm text-gray-700">Held in select communities and partner hubs</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Asynchronous Learning</h4>
                    <p className="text-sm text-gray-700">Access recorded lessons and learning materials on your own schedule</p>
                  </div>
                </div>
                <p className="text-gray-700 mt-4">No matter your location or schedule, you can join the Community and learn at your pace.</p>
              </div>
            )}
          </div>
        </div>

        {/* Partners Section */}
        {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-12">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Potential Partners</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {["The School of Politics, Policy, and Governance (SPPG)", "FixPolitics (Office Of The Citizen)", "The Budgit Foundation", "Yiaga Africa", "Connected Development Initiative (CODE)"].map((partner, index) => (
              <div key={index} className="py-4 px-6 bg-gray-50 rounded-lg flex justify-center items-center text-center">
                <p className="text-sm font-medium text-gray-700">{partner}</p>
              </div>
            ))}
          </div>
        </div> */}

        {/* Call to Action */}
        <div className="bg-[#006837] text-white rounded-xl shadow-lg p-8 md:p-10 text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">This Is Your Moment</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            If you've ever asked, "What can I do to fix Nigeria?"
            <br />
            This is your answer.
            <br />
            Become a Citizen Organiser.
          </p>
          <a
            href={airtableFormUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#006837] rounded-full text-lg font-semibold hover:bg-gray-100 transition-all shadow-lg"
          >
            Apply Now – Start Your Training <MoveRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default CitizensOrganizingSchool;