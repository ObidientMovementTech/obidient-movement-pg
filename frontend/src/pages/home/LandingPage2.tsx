import { Link } from "react-router";

import TopLogo from "../../components/TopLogo";

const LandingPage2 = (): React.ReactElement => {


  return (
    <div className="font-poppins min-h-screen flex flex-col justify-center items-center gap-8 bg-white dark:bg-background-dark transition-colors duration-300">
    

      {/* Logo Section */}
      <div className="flex flex-col justify-center items-center">
        <TopLogo />
      </div>

      <div className="flex flex-col justify-center items-center gap-4">
        <div className=" w-full gap-1 flex flex-col items-start">
          <Link
            to="/auth/login"
            className="bg-green-700 dark:bg-green-700 text-text-dark font-medium text-sm px-11 py-2 rounded-full w-full text-center"
          >
            Login
          </Link>
        </div>
        <div className=" w-full gap-1 flex flex-col items-start">
          <Link
            to="/auth/sign-up"
            className="border-accent-green border-2 text-accent-green font-medium text-sm px-11 py-2 rounded-full w-full text-center"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage2;
