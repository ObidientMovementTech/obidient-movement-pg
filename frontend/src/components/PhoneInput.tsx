import { useEffect, useState } from "react";
import ListBoxComp from "./select/ListBox";

interface Option {
  [key: string]: any;
}

interface PhoneInputProps {
  label?: string;
  onChange: (phone_number: string, country_code: string) => void;
  required?: boolean;
  defaultPhoneNumber?: string;
  defaultCountryCode?: string;
}

export default function PhoneInput({
  label = "",
  onChange,
  defaultPhoneNumber = "",
  defaultCountryCode = "+234",
  required = true,
}: PhoneInputProps) {
  const [phoneNumber, setPhoneNumber] = useState(defaultPhoneNumber);
  const [countryCode, setCountryCode] = useState(defaultCountryCode);

  useEffect(() => {
    setPhoneNumber(defaultPhoneNumber);
    setCountryCode(defaultCountryCode);
  }, [defaultPhoneNumber, defaultCountryCode]);

  function handlePhoneNumberChange(value = "") {
    if (value.length >= 15) return;
    setPhoneNumber(value);
    onChange(value, countryCode);
  }

  function handleCountryCode(value: Option) {
    setCountryCode(value?.code);
    onChange(phoneNumber, value?.code);
  }

  return (
    <div>
      <label className="block text-dark dark:text-gray-100 mb-2 text-sm">
        {label} {required && <span className="text-accent-red">*</span>}
      </label>
      <section className="grid grid-cols-[auto,1fr] items-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-200 dark:bg-secondary-light text-gray-700 dark:text-gray-200">
        <ListBoxComp
          onChange={handleCountryCode}
          defaultSelected={countryCode}
        />
        <input
          type="number"
          value={phoneNumber}
          className="bg-transparent w-full focus:outline-none"
          onChange={(e) => handlePhoneNumberChange(e.target.value)}
          required
        />
      </section>
    </div>
  );
}
