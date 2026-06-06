/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#3F9AAE',
                secondary: '#79C9C5',
                accent: '#2A7F92',
                'off-white': '#F8FAFC',
                'light-gray': '#E2E8F0',
                'text-dark': '#243943',
                'forest-dark': '#3F9AAE',
                'forest-light': '#79C9C5',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
