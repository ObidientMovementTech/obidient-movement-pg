import { MultiSelect } from "react-multi-select-component";

// Use the same OptionType as lookups.ts for consistency
type OptionType = {
  id: number;
  label: string;
  value: string;
};

type MultiSelectCompProps = {
  defaultSelected?: OptionType[];
  options?: OptionType[];
  onChange?: (value: OptionType[]) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  required?: boolean;
};

export default function MultiSelectComp({
  defaultSelected = [],
  options = [],
  onChange = () => { },
  placeholder = "Select...",
  label = "",
  className = "",
  required = false,
}: MultiSelectCompProps) {
  // Generate a unique ID for the label for accessibility
  const labelId = `multi-select-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={className}>
      <label
        id={labelId}
        className="block text-dark dark:text-gray-100 mb-2 text-sm"
      >
        {label} {required && <span className="text-accent-red">*</span>}
      </label>
      <MultiSelect
        options={options}
        value={defaultSelected} // Controlled by parent
        onChange={onChange} // Pass onChange directly
        overrideStrings={{ selectSomeItems: placeholder }} // Use placeholder correctly
        hasSelectAll={false}
        labelledBy={labelId} // Reference the label's ID for accessibility
        valueRenderer={(selected) => {
          if (selected.length === 0) return placeholder;
          return `${selected.length} selected`;
        }}
      />
    </div>
  );
}