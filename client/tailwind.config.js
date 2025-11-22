/** @type {import('tailwindcss').Config} */
module.exports = {
  // IMPORTANT: This tells Tailwind which files contain your utility classes.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Scan all files in the src folder
  ],
  theme: {
    extend: {
      // Your custom background image setting goes here!
      backgroundImage: {
        'lms-pattern': "url('./src/assets/lms_bg.jpg')", 
      }
    },
  },
  plugins: [],
}