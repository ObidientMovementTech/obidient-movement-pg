import { useState } from "react";
import statesAndLGAs from "../../../../../../lib/statesAndLGAs.js";
import type { StatesAndLGAs } from "../../../../../../types/statesAndLGAs.js";

interface CandidateFormData {
  candidateName: string;
  position: string;
  party?: string;
  state: string;
}

interface CandidateInfoProps {
  onNext: (data: CandidateFormData) => void;
}

const CandidateInfo: React.FC<CandidateInfoProps> = ({ onNext }) => {
  const [formData, setFormData] = useState<CandidateFormData>({
    candidateName: "",
    position: "",
    party: "",
    state: "",
  });

  const [error, setError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.candidateName || !formData.position || !formData.state) {
      setError("⚠️ Please fill in all required fields.");
      return;
    }

    setError("");
    onNext(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full bg-white rounded-xl p-5 sm:p-6 md:p-8 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-[#006837]">
          Candidate Information
        </h2>
      </div>

      <div className="text-sm text-gray-600 mb-6 bg-blue-50 p-3 rounded-lg">
        <p>Please provide information about the candidate you are evaluating.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Candidate Name */}
        <div className="space-y-1">
          <label htmlFor="candidateName" className="block text-sm font-medium text-gray-700">
            Full Name of Candidate <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="candidateName"
            name="candidateName"
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837] text-sm transition-colors ${error && !formData.candidateName ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            placeholder="Enter candidate's full name"
            value={formData.candidateName}
            onChange={handleChange}
            required
          />
        </div>

        {/* Position */}
        <div className="space-y-1">
          <label htmlFor="position" className="block text-sm font-medium text-gray-700">
            Position Contesting <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="position"
            name="position"
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837] text-sm transition-colors ${error && !formData.position ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            placeholder="e.g. Governor, Senator, etc."
            value={formData.position}
            onChange={handleChange}
            required
          />
        </div>

        {/* Political Party */}
        <div className="space-y-1">
          <label htmlFor="party" className="block text-sm font-medium text-gray-700">
            Political Party
          </label>
          <input
            type="text"
            id="party"
            name="party"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837] text-sm transition-colors"
            placeholder="Political Party (if applicable)"
            value={formData.party}
            onChange={handleChange}
          />
        </div>

        {/* State Select */}
        <div className="space-y-1">
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
            State of Origin <span className="text-red-500">*</span>
          </label>
          <select
            id="state"
            name="state"
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837] text-sm transition-colors ${error && !formData.state ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            value={formData.state}
            onChange={handleChange}
            required
          >
            <option value="">Select state</option>
            {Object.keys(statesAndLGAs as StatesAndLGAs).map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm font-medium p-2 mt-4 bg-red-50 rounded-lg">{error}</p>}

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          className="px-6 py-2.5 bg-[#006837] text-white rounded-lg hover:bg-[#00592e] transition-colors duration-200 text-sm font-medium flex items-center justify-center min-w-[120px]"
        >
          Continue
        </button>
      </div>
    </form>
  );
};

export default CandidateInfo;
