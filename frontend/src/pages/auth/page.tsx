import { Outlet } from "react-router";
import Logo from "../../components/TopLogo.tsx";
import BackButton from "../../components/buttons/BackButton.tsx";
// import { useEffect, useState } from "react";
// import DropdownMenu from "../../components/DropdownMenu.tsx";
// import ToggleButton from "../../components/ToggleButton.tsx";
// import BackgroundComponent from "../../components/BackgroundComponent.tsx";
// import { getCurrentUser } from "../../services/authService.ts";

const AuthPage = () => {
  // const [isLoggedIn, setIsLoggedIn] = useState(false);

  // useEffect(() => {
  //   const checkUser = async () => {
  //     try {
  //       const user = await getCurrentUser();
  //       setIsLoggedIn(!!user);
  //     } catch (err) {
  //       setIsLoggedIn(false); // If error, treat as not logged in
  //     }
  //   };

  //   checkUser();
  // }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-background-dark transition-colors duration-300 grid grid-rows-[auto,_1fr] font-poppins gap-2 relative overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center p-4">
        <div className="flex flex-col items-center">
          <Logo />
        </div>
        {/* <div className="absolute top-4 right-4">
          {isLoggedIn ? <DropdownMenu /> : <ToggleButton />}
        </div> */}
      </header>

      {/* Content */}
      <div className="flex flex-col items-center w-full z-10">
        <div className="px-4 max-w-[450px] w-full">
          <BackButton />
        </div>
        <Outlet />
      </div>

      {/* Background */}
      {/* <BackgroundComponent /> */}
    </div>
  );
};

export default AuthPage;
