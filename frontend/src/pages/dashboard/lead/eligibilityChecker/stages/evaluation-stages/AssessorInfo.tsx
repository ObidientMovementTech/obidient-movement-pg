import { useState } from 'react';
import { HelpCircle, User, Mail, Phone, Building, MapPin } from 'lucide-react';
import statesAndLGAs from '../../../../../../lib/statesAndLGAs.js';
import type { StatesAndLGAs } from '../../../../../../types/statesAndLGAs.js';

interface AssessorFormData {
  fullName: string;
  email: string;
  phone: string;
  organisation?: string;
  state: string;
  votingExperience: 'First-time voter' | 'Con-current voter' | 'Not Interested in voting';
  designation:
  | 'Electoral Commission Official'
  | 'Political Party Representative'
  | 'Civil Society Organisation Representative'
  | 'Academic/Researcher'
  | 'Independent Evaluator'
  | 'Citizen'
  | 'Other';
  otherDesignation?: string;
  relationship?: string;
}

interface Errors {
  fullName?: string;
  email?: string;
  phone?: string;
  organisation?: string;
  state?: string;
  votingExperience?: string;
  designation?: string;
  otherDesignation?: string;
  relationship?: string;
}

interface AssessorInfoProps {
  onNext: (data: AssessorFormData) => void;
}

const AssessorInfo: React.FC<AssessorInfoProps> = ({ onNext }) => {
  const [formData, setFormData] = useState<AssessorFormData>({
    fullName: '',
    email: '',
    phone: '',
    organisation: '',
    state: '',
    votingExperience: 'First-time voter',
    designation: 'Citizen',
    otherDesignation: '',
    relationship: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone.trim()) newErrors.phone = 'Phone Number is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.votingExperience) newErrors.votingExperience = 'Voting Experience is required';
    if (!formData.designation) newErrors.designation = 'Designation is required';
    if (formData.designation === 'Other' && !formData.otherDesignation?.trim())
      newErrors.otherDesignation = 'Please specify your designation';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (validateForm()) {
      // Simulate network request
      setTimeout(() => {
        onNext(formData);
        setIsSubmitting(false);
      }, 600);
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full bg-white rounded-xl p-5 sm:p-6 md:p-8 shadow-sm border border-gray-100">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-[#006837] mb-2 sm:mb-0">
          Assessor Information
        </h2>
        <button
          type="button"
          className="text-gray-500 hover:text-[#006837] flex items-center gap-1 text-sm mt-1 sm:mt-0"
          onClick={() => window.open('https://citizensunited.africa/faq', '_blank')}
          aria-label="Help"
        >
          <HelpCircle size={16} />
          <span className="hidden sm:inline">Help</span>
        </button>
      </div>

      <div className="text-sm text-gray-600 mb-6 bg-blue-50 p-3 rounded-lg">
        <p>Please provide your information as the person conducting this assessment.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Full Name Input */}
        <div className="space-y-1">
          <label htmlFor="fullName" className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <User size={14} className="flex-shrink-0" />
            <span>Full Name <span className="text-red-500">*</span></span>
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837] text-sm transition-colors ${errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
          {errors.fullName && (
            <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
          )}
        </div>

        {/* Email Input */}
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <Mail size={14} className="flex-shrink-0" />
            <span>Email <span className="text-red-500">*</span></span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837] text-sm transition-colors ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        {/* Phone Input */}
        <div className="space-y-1">
          <label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <Phone size={14} className="flex-shrink-0" />
            <span>Phone Number <span className="text-red-500">*</span></span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837] text-sm transition-colors ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          {errors.phone && (
            <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Organisation Input */}
        <div className="space-y-1">
          <label htmlFor="organisation" className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <Building size={14} className="flex-shrink-0" />
            <span>Organisation</span>
          </label>
          <input
            type="text"
            id="organisation"
            name="organisation"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837] text-sm transition-colors"
            placeholder="Enter your organisation (optional)"
            value={formData.organisation}
            onChange={handleChange}
          />
        </div>

        {/* State Select */}
        <div className="space-y-1">
          <label htmlFor="state" className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <MapPin size={14} className="flex-shrink-0" />
            <span>State <span className="text-red-500">*</span></span>
          </label>
          <select
            id="state"
            name="state"
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837] text-sm transition-colors ${errors.state ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            value={formData.state}
            onChange={handleChange}
            required
          >
            <option value="">Select your state</option>
            {Object.keys(statesAndLGAs as StatesAndLGAs).map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="text-xs text-red-500 mt-1">{errors.state}</p>
          )}
        </div>

        {/* Voting Experience Select */}
        <div className="space-y-1">
          <label htmlFor="votingExperience" className="block text-sm font-medium text-gray-700">
            Voting Experience <span className="text-red-500">*</span>
          </label>
          <select
            id="votingExperience"
            name="votingExperience"
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837] text-sm transition-colors ${errors.votingExperience ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            value={formData.votingExperience}
            onChange={handleChange}
            required
          >
            <option value="First-time voter">First-time voter</option>
            <option value="Con-current voter">Regular voter</option>
            <option value="Not Interested in voting">Not interested in voting</option>
          </select>
          {errors.votingExperience && (
            <p className="text-xs text-red-500 mt-1">{errors.votingExperience}</p>
          )}
        </div>

        {/* Designation Select */}
        <div className="space-y-1">
          <label htmlFor="designation" className="block text-sm font-medium text-gray-700">
            Designation <span className="text-red-500">*</span>
          </label>
          <select
            id="designation"
            name="designation"
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837] text-sm transition-colors ${errors.designation ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            value={formData.designation}
            onChange={handleChange}
            required
          >
            <option value="Citizen">Citizen</option>
            <option value="Electoral Commission Official">Electoral Commission Official</option>
            <option value="Political Party Representative">Political Party Representative</option>
            <option value="Civil Society Organisation Representative">Civil Society Organisation Representative</option>
            <option value="Academic/Researcher">Academic/Researcher</option>
            <option value="Independent Evaluator">Independent Evaluator</option>
            <option value="Other">Other</option>
          </select>
          {errors.designation && (
            <p className="text-xs text-red-500 mt-1">{errors.designation}</p>
          )}
        </div>

        {/* Conditional: Other Designation */}
        {formData.designation === 'Other' && (
          <div className="space-y-1">
            <label htmlFor="otherDesignation" className="block text-sm font-medium text-gray-700">
              Specify Designation <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="otherDesignation"
              name="otherDesignation"
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837] text-sm transition-colors ${errors.otherDesignation ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              placeholder="Please specify your designation"
              value={formData.otherDesignation}
              onChange={handleChange}
              required
            />
            {errors.otherDesignation && (
              <p className="text-xs text-red-500 mt-1">{errors.otherDesignation}</p>
            )}
          </div>
        )}

        {/* Relationship Input */}
        <div className="space-y-1 md:col-span-2">
          <label htmlFor="relationship" className="block text-sm font-medium text-gray-700">
            Relationship to Candidate
          </label>
          <input
            type="text"
            id="relationship"
            name="relationship"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837] text-sm transition-colors"
            placeholder="Your relationship to the candidate (optional)"
            value={formData.relationship}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="mt-8 flex items-center justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-[#006837] text-white rounded-lg hover:bg-[#00592e] transition-colors duration-200 text-sm font-medium flex items-center justify-center min-w-[120px] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            'Continue'
          )}
        </button>
      </div>
    </form>
  );
};

export default AssessorInfo;