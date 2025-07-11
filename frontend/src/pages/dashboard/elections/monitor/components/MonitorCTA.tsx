import { ExternalLink } from "lucide-react";

const MonitorCTA = () => {
  const airtableFormUrl = "https://airtable.com/app5nP9sYQaygfyE8/shrXHyHjs1cOoRE0Z"; // Replace with your actual Airtable form URL

  return (
    <div className="bg-white border w-full border-gray-200 rounded-xl p-6 text-center shadow-sm">
      <h3 className="text-3xl text-center mx-auto max-w-3xl font-semibold text-gray-800 mb-4">
        Register to join the <span className="text-green-700">Obidients Citizens Organizing School</span> and become a Vote Protection Volunteer
      </h3>
      <a
        href={airtableFormUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#006837] text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        Register <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
};

export default MonitorCTA;
