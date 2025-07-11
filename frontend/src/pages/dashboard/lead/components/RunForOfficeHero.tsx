// components/MonitorHero.tsx
// import React from 'react';

export default function RunForOfficeHero() {
  return (
    <section
      className="w-full relative py-16 md:py-24 px-4 md:px-6 text-left rounded-xl shadow-md mb-6 md:mb-10 overflow-hidden"
      style={{
        backgroundImage: `url('/15997.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40 z-0" />
      <div className="relative z-10 px-4 md:pl-16 lg:pl-20 max-w-full md:max-w-3xl text-white">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 md:mb-4">Lead – Step Into Leadership</h1>
        <p className="text-base sm:text-lg md:text-xl max-w-3xl">
          From follower to forerunner. This is where citizens become candidates and changemakers.
        </p>
      </div>
    </section>
  );
}

