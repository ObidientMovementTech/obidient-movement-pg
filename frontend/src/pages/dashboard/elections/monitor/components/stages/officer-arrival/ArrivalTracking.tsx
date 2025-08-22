import { useEffect } from 'react';

export default function ArrivalTracking({ onNext, formData, setFormData }: any) {
  useEffect(() => {
    const now = new Date().toLocaleTimeString();
    setFormData((prev: any) => ({
      ...prev,
      officerArrival: { ...prev.officerArrival, firstArrivalTime: now },
    }));
  }, []);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData((prev: any) => ({
      ...prev,
      officerArrival: {
        ...prev.officerArrival,
        [name]: fieldValue,
      },
    }));
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-[#006837]">Officer Arrival Documentation</h2>

      <div>
        <label className="block font-semibold mb-1">Last INEC Official Arrival Time</label>
        <input
          type="time"
          name="lastArrivalTime"
          value={formData.officerArrival?.lastArrivalTime || ''}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8cc63f] focus:outline-none"
        />
        <p className="text-sm text-gray-500 mt-1">Use official or observer-recorded time.</p>
      </div>

      <div>
        <label className="block font-semibold mb-1">Was the Arrival on Schedule?</label>
        <select
          name="onTimeStatus"
          value={formData.officerArrival?.onTimeStatus || ''}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8cc63f] focus:outline-none"
        >
          <option value="">Select</option>
          <option value="Yes">Yes</option>
          <option value="Late">No (Late)</option>
          <option value="Too Early">No (Too Early)</option>
        </select>
      </div>

      <div>
        <label className="block font-semibold mb-2">Proof of Arrival</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {['Time-stamped Photo', 'Bodycam Footage', 'Video of Arrival', 'App Timestamped Entry'].map((type) => (
            <label
              key={type}
              className="flex items-center gap-3 bg-gray-50 p-3 border rounded-lg cursor-pointer hover:bg-gray-100"
            >
              <input
                type="checkbox"
                name="proofTypes"
                value={type}
                checked={formData.officerArrival?.proofTypes?.includes(type)}
                onChange={(e) => {
                  const { checked, value } = e.target;
                  setFormData((prev: any) => {
                    const current = prev.officerArrival?.proofTypes || [];
                    return {
                      ...prev,
                      officerArrival: {
                        ...prev.officerArrival,
                        proofTypes: checked
                          ? [...current, value]
                          : current.filter((v: string) => v !== value),
                      },
                    };
                  });
                }}
              />
              <span className="text-sm text-gray-700">{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-semibold mb-1">Observer Notes</label>
        <textarea
          name="arrivalNotes"
          rows={4}
          value={formData.officerArrival?.arrivalNotes || ''}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8cc63f] focus:outline-none"
          placeholder="Write your observations here..."
        />
      </div>

      <div className="pt-6 text-right">
        <button
          type="button"
          onClick={() => onNext({ officerArrival: formData.officerArrival })}
          className="bg-[#006837] hover:bg-[#00552e] text-white px-6 py-3 rounded-xl font-medium transition-colors duration-300"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
