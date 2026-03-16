/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-deep': '#0d0a07',
        'bg-surface': '#1a1208',
        'bg-elevated': '#251a0e',
        'border-realm': '#3d2e1a',
        'ember': '#c4622d',
        'ember-glow': '#e8843a',
        'gold': '#c9a84c',
        'gold-light': '#e8c96a',
        'text-primary': '#f0e6d3',
        'text-secondary': '#a08060',
        'text-dim': '#5a4030',
        'gm-bg': '#1a0d0d',
        'gm-border': '#5c1a1a',
        'danger': '#8b1a1a',
        'success': '#2d5a1b',
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        'cinzel-deco': ['Cinzel Decorative', 'serif'],
        crimson: ['Crimson Text', 'serif'],
      },
    },
  },
  plugins: [],
};
