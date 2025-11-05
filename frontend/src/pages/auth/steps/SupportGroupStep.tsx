import React, { useState } from 'react';
import { Users, CheckCircle2 } from 'lucide-react';

interface Props {
  data: any;
  updateData: (data: any) => void;
  nextStep: (stepIncrement?: number) => void;
  prevStep: (stepDecrement?: number) => void;
}

const ANAMBRA_SUPPORT_GROUPS = [
  'Obidient Movement',
  'Labour Party',
  'Odinani Group',
  'Grassroots Believers Initiative (GBI)',
  'Moghalu Youths Group',
  'Moghalu Volunteer Group',
  'COPDEM'
];

const SupportGroupStep: React.FC<Props> = ({ data, updateData, nextStep, prevStep }) => {
  const [supportGroup, setSupportGroup] = useState(data.supportGroup || '');
  const [customGroup, setCustomGroup] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedGroup = supportGroup === 'Other Support Groups' && customGroup
      ? customGroup
      : supportGroup;

    if (!selectedGroup) {
      alert('Please select a support group');
      return;
    }

    updateData({ supportGroup: selectedGroup });
    nextStep();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-green-100 p-3 rounded-full">
          <Users className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Select Your Support Group</h2>
          <p className="text-gray-600 mt-1">Which organization recruited you?</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Support Group <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {ANAMBRA_SUPPORT_GROUPS.map((group) => (
              <label
                key={group}
                className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${supportGroup === group
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                  }`}
              >
                <input
                  type="radio"
                  name="supportGroup"
                  value={group}
                  checked={supportGroup === group}
                  onChange={(e) => {
                    setSupportGroup(e.target.value);
                    if (e.target.value !== 'Other Support Groups') {
                      setCustomGroup('');
                    }
                  }}
                  className="mt-1 w-5 h-5 text-green-600 border-gray-300 focus:ring-green-500"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{group}</p>
                  {supportGroup === group && (
                    <div className="mt-1 flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm">Selected</span>
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>

          {/* Custom Group Input */}
          {supportGroup === 'Other Support Groups' && (
            <div className="mt-4">
              <label htmlFor="customGroup" className="block text-sm font-medium text-gray-700 mb-2">
                Enter Support Group Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="customGroup"
                value={customGroup}
                onChange={(e) => setCustomGroup(e.target.value)}
                placeholder="E.g., My Community Association"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          )}
        </div>

        {/* Information Box */}
        {/* <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Why this matters:</p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Helps coordinate agents from different organizations</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Ensures each polling unit has diverse representation</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Makes it easier to track coverage by support group</span>
            </li>
          </ul>
        </div> */}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => prevStep()}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            ← Back
          </button>
          <button
            type="submit"
            disabled={!supportGroup || (supportGroup === 'Other Support Groups' && !customGroup)}
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default SupportGroupStep;
