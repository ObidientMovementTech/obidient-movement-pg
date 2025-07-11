import Select from "./Select";

type TextInputProps = {
  type?: string;
  value?: string;
  onChange?: (value: SelectOptionType | null) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  options?: SelectOptionType[];
  defaultSelected?: string;
};

interface SelectOptionType {
  id: number;
  label: string;
  value: any;
  unavailable?: boolean;
}

export default function FormSelect({
  onChange = () => { },
  // placeholder = "",
  label = "",
  required = false,
  options = [],
  defaultSelected = "",
  className = "",
}: TextInputProps) {
  return (
    <div className={className}>
      <label className="block text-dark dark:text-gray-100 mb-2 text-sm">
        {label} {required && <span className="text-accent-red">*</span>}
      </label>
      <Select
        options={options}
        onChange={onChange}
        defaultSelected={defaultSelected}
      />
    </div>
  );
}
