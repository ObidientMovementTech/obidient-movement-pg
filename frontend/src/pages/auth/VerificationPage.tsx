import { Link } from "react-router";

const VerificationScreen = () => {
 
  return (
    <div className=" flex flex-col justify-center items-center px-4 py-8 max-w-[450px] w-full h-[50vh] gap-4 text-2xl dark:text-text-dark">
    <p> Please check your email to verify your account</p>
    <p className="text-xs">
     If you did not receive the email, please check your <span className=" text-accent-red">spam folder</span>  or {' '}  
    <Link to={"/auth/resend"} className=" text-accent-green underline">
    Resend Email
    </Link>
    </p>
   </div>
  );
};

export default VerificationScreen;
