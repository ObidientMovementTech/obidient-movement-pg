import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeftEndOnRectangleIcon, ArrowRightEndOnRectangleIcon } from "@heroicons/react/20/solid";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function AuthButton() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          credentials: "include",
        });
        if (res.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setIsLoggedIn(false);
        navigate("/auth/login");
      } else {
        console.error("Failed to logout");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (isLoggedIn) {
    return (
      <button
        onClick={handleLogout}
        className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 hover:bg-black/10 duration-300 delay-100 dark:text-text-dark dark:hover:bg-white/10 text-text-light"
      >
        <ArrowLeftEndOnRectangleIcon className="size-4 fill-accent-green" />
        Logout
      </button>
    );
  }

  return (
    <Link
      to="/auth/login"
      className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 hover:bg-black/10 duration-300 delay-100 dark:text-text-dark dark:hover:bg-white/10 text-text-light"
    >
      <ArrowRightEndOnRectangleIcon className="size-4 fill-accent-green" />
      Login
    </Link>
  );
}
