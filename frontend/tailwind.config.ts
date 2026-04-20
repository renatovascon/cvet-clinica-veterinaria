import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}', './app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#353535',
        bone: '#ffffff',
        moss: '#00AFB0',
        sand: '#f5e9da',
        coral: '#e56b5d'
      },
      boxShadow: {
        glow: '0 20px 60px rgba(53, 53, 53, 0.18)'
      }
    }
  },
  plugins: []
};

export default config;