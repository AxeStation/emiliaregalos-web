import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#f4f0e9',
        'beige-light': '#efe5da',
        beige: '#bfb4a2',
        gold: '#ceb89f',
        'gold-strong': '#C8A96E',
        charcoal: '#606060',
        black: '#2D2D2D',
        wine: '#8B2252',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Cormorant Garamond', 'serif'],
        body: ['var(--font-body)', 'Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
