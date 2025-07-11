import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
// import { OnboardingLink, ProfileLink } from "./Links";
import AuthButton from "./buttons/AuthButton";
// import ToggleButton from "./buttons/ToggleButton";

export default function DropdownMenu() {
  return (
    <div className=" text-right">
      <Menu>
        <MenuButton className="inline-flex items-center gap-2 rounded-md bg-accent-green py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:scale-95 data-[open]:bg-accent-green duration-300 data-[focus]:outline-1 data-[focus]:outline-white">
          Menu
          <ChevronDownIcon className="size-4 fill-white/60" />
        </MenuButton>

        <MenuItems
          transition
          anchor="bottom end"
          className="w-52 z-10 origin-top-right rounded-xl border border-black/10 bg-white p-1 text-sm/6 text-black/80  transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 font-poppins dark:bg-background-dark dark:border-background-light/10 mt-2"
        >
          {/* <MenuItem>
            <ProfileLink />
          </MenuItem> */}
          {/* <MenuItem>
            <OnboardingLink />
          </MenuItem> */}
          {/* <MenuItem>
            <ToggleButton />
          </MenuItem> */}
          <MenuItem>
            <AuthButton />
          </MenuItem>
        </MenuItems>
      </Menu>
    </div>
  );
}
