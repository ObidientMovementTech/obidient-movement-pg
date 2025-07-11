import { Field, Label, Radio, RadioGroup } from "@headlessui/react";
import { useEffect, useState } from "react";

type Option = {
  label: string;
  value: any;
  id: number;
};

interface radioCompProps {
  options: Option[];
  onChange: (value: any) => void;
  label: string;
  value: string;
  required?:boolean;
}

export default function RadioComp({
  options,
  onChange,
  label,
  value="",
  required=false
}: radioCompProps) {
  const [selected, setSelected] = useState(value);
  useEffect(() => {setSelected(value)}, [value]);
  
  return (
    <div>
      <label className="block text-dark dark:text-gray-100 mb-2 text-sm">
        {label} {required && <span className="text-accent-red">*</span>}
      </label>
      <RadioGroup
        value={selected}
        onChange={(value) => {
          onChange(value);          
          setSelected(value);
        }}
        aria-label="Server size"
        className="flex gap-4"
        aria-required={required}
      >
        {options.map((option: Option) => (
          <Field key={option.id} className="flex items-center gap-2 dark:text-gray-100">
            <Radio
              value={option.value}
              className="group flex size-5 items-center justify-center rounded-full border bg-white data-[checked]:bg-accent-green"
            >
              <span className="invisible size-2 rounded-full bg-white group-data-[checked]:visible" />
            </Radio>
            <Label>{option.label}</Label>
          </Field>
        ))}
      </RadioGroup>
    </div>
  );
}
