import { Outlet } from "react-router";
import { useState, useEffect, useMemo } from "react";
import Logo from "../../components/TopLogo.tsx";
import BackButton from "../../components/buttons/BackButton.tsx";

import img1 from "../../assets/images/po1.webp";
import img2 from "../../assets/images/po2.webp";
import img3 from "../../assets/images/po3.jpg";
import img4 from "../../assets/images/po4.jpg";
import img5 from "../../assets/images/po5.jpeg";

const images = [img1, img2, img3, img4, img5];

const captions = [
  { heading: "Be a Voice for Change", text: "Be part of the change Nigeria needs. Your voice matters in building a better democracy." },
  { heading: "Together We Rise", text: "Join millions of Nigerians working towards a brighter, more accountable future." },
  { heading: "Your Vote, Your Power", text: "Democracy thrives when citizens participate. Stand up and be counted." },
  { heading: "Building a New Nigeria", text: "From grassroots to governance — the movement for a better Nigeria starts with you." },
  { heading: "Strength in Unity", text: "When we come together with purpose, no challenge is too great to overcome." },
];

const AuthPage = () => {
  const imageIndex = useMemo(() => Math.floor(Math.random() * images.length), []);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = images[imageIndex];
    img.onload = () => setLoaded(true);
  }, [imageIndex]);

  return (
    <div className="min-h-screen flex font-poppins">
      {/* Left side — form */}
      <div className="w-full lg:w-1/2 min-h-screen bg-white dark:bg-background-dark transition-colors duration-300 flex flex-col overflow-y-auto">
        {/* Header */}
        <header className="flex items-center justify-between p-4 shrink-0">
          <Logo />
        </header>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center w-full px-4 pb-8">
          <div className="max-w-[450px] w-full">
            <BackButton />
          </div>
          <Outlet />
        </div>
      </div>

      {/* Right side — image (hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div
          className={`absolute inset-0 bg-accent-green/20 transition-opacity duration-700 ${loaded ? "opacity-0" : "opacity-100"}`}
        />
        <img
          src={images[imageIndex]}
          alt="Obidient Movement"
          className={`h-full w-full object-cover transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
        {/* Gradient overlay + caption */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12 text-white">
          <h2 className="text-2xl lg:text-3xl font-bold mb-2">{captions[imageIndex].heading}</h2>
          <p className="text-sm lg:text-base text-white/85 max-w-md">{captions[imageIndex].text}</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
