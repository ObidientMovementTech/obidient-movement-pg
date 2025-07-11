import TopLogo from "./TopLogo";
import Menu from "./DropdownMenu";

export default function Header() {
  return (
    <header className=" flex justify-between items-center p-4 w-full">
      <TopLogo />

      <Menu />
    </header>
  );
}
