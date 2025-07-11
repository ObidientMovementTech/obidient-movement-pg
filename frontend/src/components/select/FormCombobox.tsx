// import { useEffect } from "react";
import ComboboxComp from "./Combobox";
// import { supabase } from "../../supabase";

type TextInputProps = {
  type?: string;
  value?: string;
  onChange?: (value:SelectOptionType | null) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  required?: boolean;
  options?: SelectOptionType[];
  defaultSelected?: string;
};
interface SelectOptionType {
  id: number;
  label: string;
  value: any;
  unavailable?: boolean;
}

export default function FormCombobox({
  // type = "",
  // value = "",
  onChange = () => {},
  // placeholder = "",
  label = "",
  // className = "",
  required = false,
  options = [],
  defaultSelected = "",
}: TextInputProps) {
  // console.log('defaultSelected', defaultSelected);
  
  return (
    <div>
      <label className="block text-dark dark:text-gray-100 mb-2 text-sm">
        {label} {required && <span className="text-accent-red">*</span>}
      </label>
      <ComboboxComp options={options} onChange={onChange} defaultSelected={defaultSelected}/>
    </div>
  );
}
