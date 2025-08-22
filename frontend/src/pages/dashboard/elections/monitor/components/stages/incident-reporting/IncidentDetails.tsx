import { useState } from "react";

interface IncidentDetailsProps {
  onNext: (data: any) => void;
  formData: any;
  setFormData: (data: any) => void;
}

type IncidentDetails = {
  officerName: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  captureMethod: string[];
  weatherCondition: string;
  irregularities: string[];
  narrative: string;
  perpetrators: string;
  victims: string;
  officialsPresent: string;
};


const irregularityOptions = [
  "Result Falsification",
  "Vote Buying / Inducement",
  "Voter Suppression / Intimidation",
  "Physical Violence",
  "Ballot Box Snatching / Destruction",
  "Procedural Misconduct by INEC Staff",
  "Security Officer Misconduct",
  "Late Arrival of Materials",
  "Equipment Failure (e.g., BVAS malfunction)",
  "Missing Electoral Materials",
  "Unauthorized Persons at Polling Unit",
  "Other",
];

export default function IncidentDetails({ onNext, setFormData }: IncidentDetailsProps) {
  const [details, setDetails] = useState<IncidentDetails>({
    officerName: '',
    date: '',
    timeStart: '',
    timeEnd: '',
    captureMethod: [],
    weatherCondition: '',
    irregularities: [],
    narrative: '',
    perpetrators: '',
    victims: '',
    officialsPresent: '',
  });


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setDetails((prev: IncidentDetails) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (option: string, field: "captureMethod" | "irregularities") => {
    setDetails((prev: IncidentDetails) => {
      const current = prev[field];
      return {
        ...prev,
        [field]: current.includes(option)
          ? current.filter((o) => o !== option)
          : [...current, option],
      };
    });
  };


  const handleSubmit = () => {
    setFormData((prev: any) => ({
      ...prev,
      incidentDetails: details,
    }));
    onNext({ incidentDetails: details });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-medium mb-1">INEC Officer Name/ID (if known)</label>
        <input
          type="text"
          name="officerNameOrId"
          value={details.officerName}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Date of Incident</label>
          <input type="date" name="date" value={details.date} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium mb-1">Time of Incident (Start)</label>
          <input type="time" name="startTime" value={details.timeStart} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium mb-1">Time of Incident (End)</label>
          <input type="time" name="endTime" value={details.timeEnd} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium mb-1">Weather/Lighting Condition</label>
          <input type="text" name="weatherCondition" value={details.weatherCondition} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
      </div>

      <div>
        <label className="block font-medium mb-1">Method of Capture</label>
        {['Mobile Camera', 'Body Camera', 'Physical Observation Only', 'Other'].map((method) => (
          <label key={method} className="block text-sm">
            <input
              type="checkbox"
              checked={details.captureMethod.includes(method)}
              onChange={() => handleCheckboxChange(method, 'captureMethod')}
              className="mr-2"
            />
            {method}
          </label>
        ))}
      </div>

      <div>
        <label className="block font-medium mb-1">Type of Electoral Irregularity</label>
        {irregularityOptions.map((item) => (
          <label key={item} className="block text-sm">
            <input
              type="checkbox"
              checked={details.irregularities.includes(item)}
              onChange={() => handleCheckboxChange(item, 'irregularities')}
              className="mr-2"
            />
            {item}
          </label>
        ))}
        {details.irregularities.includes('Other') && (
          <input
            type="text"
            name="irregularityOther"
            value={details.irregularities}
            onChange={handleChange}
            placeholder="Specify other irregularity"
            className="w-full border rounded px-3 py-2 mt-2"
          />
        )}
      </div>

      <div>
        <label className="block font-medium mb-1">Detailed Account of Incident</label>
        <textarea
          name="narrative"
          value={details.narrative}
          onChange={handleChange}
          rows={6}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block font-medium mb-1">Perpetrators (if identifiable)</label>
          <input type="text" name="perpetrators" value={details.perpetrators} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium mb-1">Victims (if applicable)</label>
          <input type="text" name="victims" value={details.victims} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium mb-1">Officials Present</label>
          <input type="text" name="officialsPresent" value={details.officialsPresent} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
      </div>

      <div className="pt-6">
        <button
          onClick={handleSubmit}
          className="bg-[#006837] text-white px-6 py-2 rounded hover:bg-[#00552d]"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
