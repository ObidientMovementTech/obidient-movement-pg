import { useEffect, useState } from "react";
import { MultiSelect } from "react-multi-select-component";


export type OptionType = {
  label: string;
  value: string | number;
  disabled?: boolean;
}

type TextInputProps = {
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
  placeholder = "",
  label = "",
  required = false,
}: TextInputProps) {

  const [selected, setSelected] = useState<OptionType[]>([]);

  useEffect(() => {
    if (defaultSelected?.length > 0) {
      const filteredSelected = options.filter((option) =>
        defaultSelected.some((selected) => selected.value === option.value)
      );
      setSelected(filteredSelected);
    }
  }, [options, defaultSelected]);

  return (
    <div>
      <label className="block text-dark dark:text-gray-100 mb-2 text-sm">{label} {required && <span className="text-accent-red">*</span>}</label>
      <MultiSelect
        options={options}
        value={selected}
        onChange={(value: OptionType[]) => { onChange(value); setSelected(value) }}
        labelledBy={placeholder}
        hasSelectAll={false}
        valueRenderer={(selected) => {
          if (selected.length === 0) return placeholder;
          return `${selected.length} selected`;
        }}
      />
    </div>
  );
};