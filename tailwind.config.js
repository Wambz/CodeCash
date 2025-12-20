/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: '#f90612', // Updated Red from User design
                'background-light': '#f8f5f6',
                'background-dark': '#230f10',
                accent: '#00FF00', // Green
                background: '#000000', // Black
                surface: '#121212', // Slightly lighter black for cards
            },
            fontFamily: {
                "display": ["Inter", "sans-serif"]
            },
            scale: {
                '102': '1.02',
            },
        },
    },
    plugins: [],
}
