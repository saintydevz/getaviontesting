/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'avion-purple': '#ad92ff',
                'avion-dark': '#0a0a0f',
            }
        },
    },
    plugins: [],
}
