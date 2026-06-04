/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#28A745',      // Primary Green - Growth & Community
                secondary: '#218838',    // Secondary Green - Depth
                accent: '#66BB6A',       // Accent Green - Energetic Highlight
                'off-white': '#F8F9FA',  // Off-White - Subtle Contrast
                'light-gray': '#E9ECEF', // Light Gray - Dividers
                'text-dark': '#212529',  // Text Black - Readability
                'forest-dark': '#1B5E20', // Deep Forest Green - Admin Theme
                'forest-light': '#2E7D32', // Lighter Forest Green - Hover State
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
