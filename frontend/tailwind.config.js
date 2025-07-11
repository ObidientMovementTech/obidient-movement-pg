// import lineClamp from "@tailwindcss/line-clamp";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      backgroundImage: {
        hero: "url('tnnp_bkg-01.jpg.jpg')"
      },
      keyframes: {
        'slow-zoom': {
          '0%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1.1)' }
        },
        'fadeIn': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        'fadeInUp': {
          '0%': {
            opacity: 0,
            transform: 'translateY(20px)'
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)'
          }
        },
        'slideInRight': {
          '0%': {
            opacity: 0,
            transform: 'translateX(20px)'
          },
          '100%': {
            opacity: 1,
            transform: 'translateX(0)'
          }
        },
        'slideInLeft': {
          '0%': {
            opacity: 0,
            transform: 'translateX(-20px)'
          },
          '100%': {
            opacity: 1,
            transform: 'translateX(0)'
          }
        },
        'slide-left': {
          '0%': { transform: 'translateX(0)' },
          '10%': { opacity: 0.8, transform: 'translateX(5%)' },
          '100%': { opacity: 1, transform: 'translateX(0)' }
        },
        'slide-right': {
          '0%': { transform: 'translateX(0)' },
          '10%': { opacity: 0.8, transform: 'translateX(-5%)' },
          '100%': { opacity: 1, transform: 'translateX(0)' }
        }
      },
      animation: {
        'slow-zoom': 'slow-zoom 20s ease-in-out forwards',
        'fadeIn': 'fadeIn 0.3s ease-in-out forwards',
        'fadeInUp': 'fadeInUp 0.4s ease-out forwards',
        'slideInRight': 'slideInRight 0.3s ease-out forwards',
        'slideInLeft': 'slideInLeft 0.3s ease-out forwards',
        'slide-left': 'slide-left 0.5s ease-out forwards',
        'slide-right': 'slide-right 0.5s ease-out forwards'
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      gridTemplateColumns: {
        fluid: "repeat(auto-fit, minmax(250px, 300px))",
        "fluid-sm": "repeat(auto-fit, minmax(250px, 1fr))",
        "fluid-lg": "repeat(auto-fit, minmax(350px, 1fr))",
        "fluid-table": "repeat(auto-fill, minmax(auto, 1fr))",
      },
      colors: {
        background: {
          dark: "#232323",
          light: "#ffffff",
        },
        secondary: {
          light: "#2d2d2d",
          dark: "#5E5E5E",
        },
        accent: {
          green: "#0B6739",
          red: "#D21C5B",
        },
        text: {
          dark: "#e5e5e5",
          muted: "#9ca3af",
          light: "#000000",
        },
      },
    },
  },
  plugins: [
    // Removed tailwind-scrollbar plugin
  ],
};
