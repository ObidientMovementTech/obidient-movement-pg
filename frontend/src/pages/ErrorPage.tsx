// import React from "react";
import { useRouteError } from "react-router";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div
      id="error-page"
      className="font-poppins dark:text-white bg-background min-h-screen flex justify-center items-center flex-col text-text gap-8"
    >
      <h1 className="text-4xl">404</h1>
      <h1>Page Not Found</h1>
      <p>
        To go back to the home page{" "}
        <a href="/" className="text-accent-green">
          Click Here
        </a>
        .
      </p>
    </div>
  );
}
