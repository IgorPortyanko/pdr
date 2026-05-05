/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        hand: ['"Kalam"', '"Comic Sans MS"', 'cursive'],
        bold: ['"Caveat"', '"Kalam"', 'cursive'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: 'var(--c-text)',
          2: 'var(--c-text-2)',
          3: 'var(--c-text-5)',
        },
        paper: {
          DEFAULT: 'var(--c-bg)',
          alt: 'var(--c-surface-2)',
        },
        accent: {
          DEFAULT: 'var(--c-accent)',
          soft: 'var(--c-accent-soft)',
        },
        status: {
          review: { DEFAULT: '#7a5a1e', bg: '#f6edd3' },
        },
      },
      borderRadius: {
        rough: '4px 3px 5px 3px',
      },
    },
  },
  plugins: [],
};
