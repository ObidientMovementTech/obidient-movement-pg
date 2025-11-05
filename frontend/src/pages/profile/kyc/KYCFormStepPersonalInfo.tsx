import { useState, useEffect } from "react";
import TextInput from "../../../components/inputs/TextInput.js";
import PhoneInput from "../../../components/PhoneInput.js";
import FormSelect from "../../../components/select/FormSelect.js";
// import NextButton from "../../../components/NextButton";
import BackButton from "../../../components/BackButton.js";
import { genderOptions, ageRangeOptions } from "../../../utils/lookups.js";
import { getStateNames, getFormattedLGAs, getFormattedWards } from "../../../utils/StateLGAWardPollingUnits";
import { countries } from "../../../utils/countries.js";
import { OptionType } from "../../../utils/lookups.js";
import { savePersonalInfoStep } from "../../../services/kycService.js";
import { toast } from "react-hot-toast";

interface PersonalInfo {
  first_name: string;
  middle_name: string;
  last_name: string;
  user_name: string;
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

export default function KYCFormStepPersonalInfo({ initialData, onNext, onBack }: Props) {
  const [formData, setFormData] = useState<PersonalInfo>(initialData || defaultValues);
  const [states, setStates] = useState<OptionType[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const stateNames = getStateNames();
    const stateOptions = stateNames.map((stateName, i) => ({
      id: i,
      label: stateName,
      value: stateName,
    }));
    setStates(stateOptions);
  }, []);

  const getLgas = (stateName: string): OptionType[] => {
    if (!stateName) return [];
    const formattedLGAs = getFormattedLGAs(stateName);
    return formattedLGAs.map((lga, i) => ({
      id: i,
      label: lga.label,
      value: lga.value
    }));
  };

  const getWards = (stateName: string, lgaName: string): OptionType[] => {
    if (!stateName || !lgaName) return [];
    const formattedWards = getFormattedWards(stateName, lgaName);
    return formattedWards.map((ward, i) => ({
      id: i,
      label: ward.label,
      value: ward.value
    }));
  };

  const validateForm = (): boolean => {
    // Simplified validation for testing
    if (!formData.first_name?.trim()) {
      toast.error("First name is required");
      return false;
    }

    if (!formData.last_name?.trim()) {
      toast.error("Last name is required");
      return false;
    }

    // Skip other validations for now
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      // Stop the form from submitting normally
      e.preventDefault();

      console.log("========== FORM SUBMISSION STARTED ==========");
      console.log("Form event:", e);
      console.log("Form target:", e.target);
      console.log("Form data:", formData);

      // Validate the form first
      if (!validateForm()) {
        console.log("Form validation failed");
        return;
      }

      setIsSaving(true);
      console.log("Saving to backend...");

      // Save the personal info to the backend
      await savePersonalInfoStep(formData);
      console.log("Backend save successful");

      // Call onNext to move to the next step
      console.log("Calling onNext with:", formData);
      console.log("onNext function:", onNext);
      onNext(formData);
      console.log("onNext called");

      toast.success("Personal information saved successfully");
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error("Failed to save personal information. See console for details.");
    } finally {
      setIsSaving(false);
      console.log("========== FORM SUBMISSION ENDED ==========");
    }
  };

  // Auto-save when form field loses focus after changes
  const handleFieldBlur = async (updatedFormData: PersonalInfo) => {
    try {
      // Only save if we have at least first name, last name and username
      if (updatedFormData.first_name && updatedFormData.last_name && updatedFormData.user_name) {
        await savePersonalInfoStep(updatedFormData);
      }
    } catch (error) {
      console.error("Error auto-saving personal information:", error);
      // No need for error toast on auto-save, to avoid disrupting user
    }
  };

  // Debounce auto-save to prevent excessive API calls while user is typing
  const debounce = <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ) => {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedAutoSave = debounce(handleFieldBlur, 1500);

  const handleInputChange = (updatedFormData: PersonalInfo) => {
    setFormData(updatedFormData);
    debouncedAutoSave(updatedFormData);
  };

  return (
    <form onSubmit={handleSubmit} className="grid max-w-6xl mx-auto w-full gap-8 mt-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <TextInput
          label="First Name"
          placeholder="e.g. Tolu"
          value={formData.first_name}
          onChange={(e) => handleInputChange({ ...formData, first_name: e.target.value })}
          required
        />
        <TextInput
          label="Middle Name"
          placeholder="e.g. Emmanuel"
          value={formData.middle_name}
          onChange={(e) => handleInputChange({ ...formData, middle_name: e.target.value })}
        />
        <TextInput
          label="Last Name"
          placeholder="e.g. Olumide"
          value={formData.last_name}
          onChange={(e) => handleInputChange({ ...formData, last_name: e.target.value })}
          required
        />
        <TextInput
          label="Username or Nickname"
          placeholder="e.g. voteforchange"
          value={formData.user_name}
          onChange={(e) => handleInputChange({ ...formData, user_name: e.target.value })}
          required
        />
        <FormSelect
          label="Gender"
          options={genderOptions}
          defaultSelected={formData.gender}
          onChange={(opt) => {
            if (opt) handleInputChange({ ...formData, gender: opt.value });
          }}
          required
        />
        <FormSelect
          label="Age Range"
          options={ageRangeOptions}
          defaultSelected={formData.age_range}
          onChange={(opt) => {
            if (opt) handleInputChange({ ...formData, age_range: opt.value });
          }}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormSelect
          label="Citizenship"
          options={[
            { id: 1, label: "Nigerian Citizen", value: "Nigerian Citizen" },
            { id: 2, label: "Diasporan", value: "Diasporan" },
            { id: 3, label: "Foreigner", value: "Foreigner" },
          ]}
          defaultSelected={formData.citizenship}
          onChange={(opt) => {
            if (opt) {
              const newFormData = {
                ...formData,
                citizenship: opt.value,
                country_of_residence: opt.value === "Nigerian Citizen" ? "Nigeria" : formData.country_of_residence
              };
              handleInputChange(newFormData);
            }
          }}
          required
        />
        <FormSelect
          label="Country of Residence"
          options={countries}
          defaultSelected={formData.country_of_residence || "Nigeria"}
          onChange={(opt) => {
            if (opt) handleInputChange({ ...formData, country_of_residence: opt.value });
          }}
          required
        />
        <FormSelect
          label="Your State of Origin"
          options={states}
          defaultSelected={formData.state_of_origin}
          onChange={(opt) => {
            if (opt) handleInputChange({ ...formData, state_of_origin: opt.value });
          }}
          required
        />
        <PhoneInput
          label="WhatsApp Phone Number"
          defaultPhoneNumber={formData.phone_number}
          defaultCountryCode={formData.country_code}
          onChange={(num, code) => {
            handleInputChange({ ...formData, phone_number: num, country_code: code });
          }}
        />
        <FormSelect
          label="Voting State"
          options={states}
          defaultSelected={formData.voting_engagement_state}
          onChange={(opt) => {
            if (opt) handleInputChange({ ...formData, voting_engagement_state: opt.value, lga: '', ward: '' });
          }}
          required
        />
        <FormSelect
          label="LGA"
          options={getLgas(formData.voting_engagement_state)}
          defaultSelected={formData.lga}
          onChange={(opt) => {
            if (opt) handleInputChange({ ...formData, lga: opt.value, ward: '' });
          }}
          required
        />
        <FormSelect
          label="Ward"
          options={getWards(formData.voting_engagement_state, formData.lga)}
          defaultSelected={formData.ward}
          onChange={(opt) => {
            if (opt) handleInputChange({ ...formData, ward: opt.value });
          }}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormSelect
          label="Are you a voter?"
          options={[
            { id: 1, label: "Yes", value: "Yes" },
            { id: 2, label: "No", value: "No" },
          ]}
          defaultSelected={formData.isVoter}
          onChange={(opt) => {
            if (opt) handleInputChange({ ...formData, isVoter: opt.value });
          }}
          required
        />
        <FormSelect
          label="Will you vote?"
          options={[
            { id: 1, label: "Yes", value: "Yes" },
            { id: 2, label: "No", value: "No" },
          ]}
          defaultSelected={formData.willVote}
          onChange={(opt) => {
            if (opt) handleInputChange({ ...formData, willVote: opt.value });
          }}
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
          <button
            type="submit"
            className="flex items-center justify-center bg-accent-green text-white w-full font-bold py-3 px-6 rounded-xl hover:scale-95 duration-300"
            disabled={isSaving}
            onClick={(e) => {
              if (isSaving) return;
              // This is a backup handler in case the form's onSubmit isn't working
              e.preventDefault();
              handleSubmit(e);
            }}
          >
            {isSaving ? "Saving..." : "Next"}
          </button>
        </div>
      </div>
    </form>
  );
}
