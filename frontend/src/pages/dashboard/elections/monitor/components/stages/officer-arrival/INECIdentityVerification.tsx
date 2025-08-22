import { useState } from 'react';

interface OfficerPhoto {
  name: string;
  photo: File | null;
  preview?: string;
}

interface INECIdentityProps {
  onNext: (data: any) => void;
  formData: any;
  setFormData: (data: any) => void;
}

export default function INECIdentityVerification({
  onNext,
  formData,
  setFormData,
}: INECIdentityProps) {
  const [data, setData] = useState<Record<string, OfficerPhoto>>(
    formData.officerArrival?.officerNames || {
      po: { name: '', photo: null },
      apo1: { name: '', photo: null },
      apo2: { name: '', photo: null },
      apo3: { name: '', photo: null },
    }
  );

  const handleNameChange = (role: string, name: string) => {
    const updated = {
      ...data,
      [role]: {
        ...data[role],
        name,
      },
    };
    setData(updated);
    setFormData({
      ...formData,
      officerArrival: {
        ...formData.officerArrival,
        officerNames: updated,
      },
    });
  };

  const handlePhotoChange = (role: string, file: File | null) => {
    const preview = file ? URL.createObjectURL(file) : undefined;
    const updated = {
      ...data,
      [role]: {
        ...data[role],
        photo: file,
        preview,
      },
    };
    setData(updated);
    setFormData({
      ...formData,
      officerArrival: {
        ...formData.officerArrival,
        officerNames: updated,
      },
    });
  };

  const handleNext = () => {
    onNext({
      officerArrival: {
        ...formData.officerArrival,
        officerNames: data,
      },
    });
  };

  return (
    <div className="space-y-10">
      <h2 className="text-2xl font-bold text-[#006837]">INEC Officer Verification</h2>

      {['po', 'apo1', 'apo2', 'apo3'].map((role) => (
        <div
          key={role}
          className="grid grid-cols-1 md:grid-cols-2 items-start gap-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          {/* Officer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 capitalize mb-1">
              {role} Full Name
            </label>
            <input
              type="text"
              value={data[role].name}
              onChange={(e) => handleNameChange(role, e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8cc63f]"
              placeholder="e.g. John Doe"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 capitalize mb-1">
              Upload {role} Photo
            </label>
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoChange(role, e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
              <p className="text-sm text-gray-500 text-center">
                Click or drag to upload photo
              </p>
              {data[role].preview && (
                <img
                  src={data[role].preview}
                  alt={`${role} preview`}
                  className="mt-4 h-24 w-24 object-cover rounded-full border mx-auto"
                />
              )}
            </div>
          </div>
        </div>
      ))}

      <div className="pt-4 text-right">
        <button
          type="button"
          onClick={handleNext}
          className="bg-[#006837] hover:bg-[#00552e] text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
