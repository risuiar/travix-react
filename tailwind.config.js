/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      backgroundImage: {
        "gradient-1": "linear-gradient(to right, #3B82F6, #A78BFA)", // blue-500 to purple-400
        "gradient-2": "linear-gradient(to right, #EC4899, #F87171)", // pink-500 to red-400
        "gradient-3": "linear-gradient(to right, #22C55E, #14B8A6)", // green-500 to teal-400
        "gradient-4": "linear-gradient(to right, #EAB308, #FB923C)", // yellow-500 to orange-400
        "gradient-5": "linear-gradient(to right, #6366F1, #38BDF8)", // indigo-500 to sky-400
        "gradient-6": "linear-gradient(to right, #F43F5E, #F472B6)", // rose-500 to pink-400
        "gradient-7": "linear-gradient(to right, #84CC16, #10B981)", // lime-500 to emerald-400
        "gradient-8": "linear-gradient(to right, #06B6D4, #3B82F6)", // cyan-500 to blue-400
        "gradient-9": "linear-gradient(to right, #F59E0B, #A3E635)", // amber-500 to lime-400
        "gradient-10": "linear-gradient(to right, #8B5CF6, #E879F9)", // violet-500 to fuchsia-400
      },
    },
  },
  plugins: [],
};
