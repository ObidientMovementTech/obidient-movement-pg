import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useState, useRef, useEffect } from "react";

interface SelectOptionType {
  id: number;
  label: string;
  value: any;
  unavailable?: boolean;
}

interface ComboboxCompProps {
  className?: string;
  options?: SelectOptionType[];
  onChange: (value: SelectOptionType | null) => void;
  defaultSelected?: string;
}

export default function ComboboxComp({
  className = "",
  options = [],
  onChange = () => {},
  defaultSelected = "",
}: ComboboxCompProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SelectOptionType | null>(null);
  const [inputValue, setInputValue] = useState(""); // Add a separate state for input value
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (defaultSelected) {
      const defaultSelectedOption = options.find(option => option.value === defaultSelected);
      if (defaultSelectedOption) {
        setSelected(defaultSelectedOption);
        setInputValue(defaultSelectedOption.label);
      }
    }
  }, [defaultSelected, options]);

  const filteredOptions =
    query === ""
      ? options
      : options.filter((person) => {
          return person?.value.toLowerCase().includes(query.toLowerCase());
        });

  // Function to manually trigger button click
  const openDropdown = () => {
    buttonRef.current?.click();
  };

  return (
    <>
      <Combobox
        value={selected}
        onChange={(value) => {
          onChange(value);
          setSelected(value);
          setInputValue(value?.label || "");
        }}
        onClose={() => setQuery("")}
      >
        <div className="relative px-3 bg-gray-200 dark:bg-secondary-light rounded-lg flex gap-4">
          <ComboboxInput
            className={clsx(
              `w-full py-3 bg-gray-200 dark:bg-secondary-light text-gray-700 dark:text-gray-200 ${className}`,
              "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 "
            )}
            placeholder={`${defaultSelected || ""} - Select or Type In`}
            onChange={(event) => {
              setQuery(event.target.value);
              setInputValue(event.target.value);
            }}
            onClick={openDropdown}
            value={inputValue} // Use the controlled inputValue instead of selected?.label
          />
          <ComboboxButton ref={buttonRef} className="group">
            <ChevronDownIcon className="size-3 dark:text-white " />
          </ComboboxButton>
        </div>

        <ComboboxOptions
          anchor="bottom"
          transition
          className={clsx(
            "w-[var(--input-width)] rounded-xl border border-black/50 bg-white p-1 [--anchor-gap:var(--spacing-1)] z-20",
            "transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0"
          )}
        >
          {filteredOptions.length === 0 ? (
            <div className="py-2 px-3 text-sm text-gray-500">
              No results found
            </div>
          ) : (
            filteredOptions.map((person) => (
              <ComboboxOption
                key={person.id}
                value={person}
                className="group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-white/10"
              >
                <CheckIcon className="invisible size-4 group-data-[selected]:visible" />
                <div className="text-sm/6 text-black placeholder-black/40">
                  {person.label}
                </div>
              </ComboboxOption>
            ))
          )}
        </ComboboxOptions>
      </Combobox>
    </>
  );
}