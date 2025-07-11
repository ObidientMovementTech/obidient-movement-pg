import { useEffect, useState } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import clsx from "clsx";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

interface SelectOptionType {
  id: number;
  label: string;
  value: any;
  unavailable?: boolean;
}

type SelectProps = {
  options: SelectOptionType[];
  onChange: (value: SelectOptionType) => void;
  defaultSelected: string;
};

export default function Select({
  options,
  onChange,
  defaultSelected,
}: SelectProps) {
  const defaultOption = options.filter(
    (option) => option.value?.toLocaleLowerCase() === defaultSelected?.toLocaleLowerCase()
  );

  const initialOption = defaultOption[0] || null
  
  const [selectedOption, setSelectedOption] = useState<SelectOptionType | null>(initialOption);

  function onSelectItem(value: SelectOptionType) {    
    setSelectedOption(value);
    onChange(value);
  }

  useEffect(() => {
    setSelectedOption(initialOption)
  }, [initialOption])
  

  return (
    <Listbox value={selectedOption} onChange={onSelectItem} >
      <ListboxButton
        className={clsx(
                   "relative rounded-lg bg-gray-200 dark:bg-secondary-light p-3 text-left text-sm/6 text-black/80 dark:text-white w-full flex items-center justify-between",
          "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
        )}
      >
        {selectedOption?.label || 'Select'}
        <ChevronDownIcon
          className="group pointer-events-none size-4 fill-black/60 dark:fill-white/60"
          aria-hidden="true"
        />
      </ListboxButton>
      <ListboxOptions
        anchor="bottom"
        transition
        className={clsx(
          "w-[var(--button-width)]  rounded-xl border-2 border-white/10 bg-background-dark text-white [--anchor-gap:var(--spacing-1)] focus:outline-none z-40",
          "transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0 "
        )}
      >
        {options.map((option: any) => (
          <ListboxOption
            key={option?.id}
            value={option}
            className={`  p-2 border-b border-white/10  duration-300 cursor-pointer flex gap-2 ${
              option?.unavailable ? "text-white/50" : "hover:bg-white/10"
            }`}
            disabled={option?.unavailable}
          >
            {option.label}
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  );
}
