import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { countryCodes } from "../../utils/countryCodes";
import Flag from "@weston/react-world-flags";

export interface Option {
  [key: string]: any;
}

interface ListboxCompProps {
  // className?: string;
  // options: Option[];
  onChange: (value: Option) => void;
  defaultSelected?: string;
}

export default function ListBoxComp({
  onChange = () => {},
  defaultSelected="+234"
}: ListboxCompProps) {
  const [defaultCountryCode] = countryCodes.filter((country) => country.code === defaultSelected)
  const [selectedCountry, setSelectedCountry] = useState(defaultCountryCode);

  return (
    <Listbox
      value={selectedCountry}
      onChange={(value) => {
        onChange(value);
        setSelectedCountry(value);
      }}
    >
      <ListboxButton className={"flex gap-2 items-center"}>
        {" "}
        <Flag code={selectedCountry?.flag} className="w-6 h-6" />{" "}
        <ChevronDownIcon className="size-4" />{" "}
        <span>{selectedCountry?.code}</span>
      </ListboxButton>
      <ListboxOptions anchor="bottom" className={"bg-white z-10"}>
        {countryCodes?.map((country, index) => (
          <ListboxOption
            key={index}
            value={country}
            className="data-[focus]:bg-blue-100 cursor-pointer flex gap-2 p-2 border-b "
          >
            <span>{country?.name}</span>{" "}
            <Flag code={country?.flag} className="w-6 h-6" />{" "}
            <span>({country?.code})</span>
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  );
}
