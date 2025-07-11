import { useState } from "react";
import NextButton from "../../../components/NextButton";
import BackButton from "../../../components/BackButton";
import TextInput from "../../../components/inputs/TextInput";
import { toast } from "react-hot-toast";
import { savePersonalInfoStep } from "../../../services/kycService";

interface PersonalInfo {
  first_name: string;
  last_name: string;
  user_name: string;
  middle_name: string;
  phone_number: string;
  country_code: string;
  gender: string;
  lga: string;
  ward: string;
  age_range: string;
  state_of_origin: string;
  voting_engagement_state: string;
  citizenship: string;
  isVoter: string;
  willVote: string;
  country_of_residence: string;
}

interface Props {
  initialData?: PersonalInfo;
  onNext: (data: PersonalInfo) => void;
  onBack?: () => void;
}

// Default values for the form
const defaultValues: PersonalInfo = {
  first_name: "",
  middle_name: "",
  last_name: "",
  user_name: "",
  phone_number: "",
  country_code: "+234",
  gender: "",
  lga: "",
  ward: "",
  age_range: "",
  state_of_origin: "",
  voting_engagement_state: "",
  citizenship: "",
  isVoter: "",
  willVote: "",
  country_of_residence: "Nigeria",
};

export default function KYCFormStepPersonalInfoSimple({ initialData, onNext, onBack }: Props) {
  const [formData, setFormData] = useState<PersonalInfo>(initialData || defaultValues);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted");

    try {
      setIsSaving(true);
      console.log("Saving personal info...", formData);

      // Save to backend
      await savePersonalInfoStep(formData);

      // Call onNext to move to the next step
      console.log("Moving to next step with data:", formData);
      onNext(formData);

      toast.success("Personal info saved successfully");
    } catch (error: any) {
      console.error("Error saving:", error);
      toast.error(error.message || "Failed to save personal information");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid max-w-6xl mx-auto w-full gap-8 mt-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <TextInput
          label="First Name"
          placeholder="e.g. Tolu"
          value={formData.first_name}
          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
          required
        />
        <TextInput
          label="Last Name"
          placeholder="e.g. Olumide"
          value={formData.last_name}
          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
          required
        />
      </div>

      <div className="flex justify-between items-center">
        <div className="max-w-[100px]">
          {onBack && (
            <BackButton content="Back" onClick={onBack} disabled={isSaving} />
          )}
        </div>
        <div className="max-w-[100px]">
          <NextButton content={isSaving ? "Saving..." : "Next"} disabled={isSaving} />
        </div>
      </div>
    </form>
  );
}
