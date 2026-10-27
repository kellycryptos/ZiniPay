/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Space Grotesk"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"IBM Plex Mono"', '"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        canvas: '#0A0B0E',
        panel: '#111318',
        'panel-alt': '#161922',
        'panel-header': '#141720',
        'border-subtle': '#1F2432',
        'border-strong': '#2C3447',
        near: {
          green: '#00EC97',
          'green-subtle': 'rgba(0, 236, 151, 0.10)',
          'green-border': 'rgba(0, 236, 151, 0.28)',
        },
        status: {
          passed: '#00EC97',
          'passed-subtle': 'rgba(0, 236, 151, 0.10)',
          'passed-border': 'rgba(0, 236, 151, 0.28)',
          blocked: '#FF4D4D',
          'blocked-subtle': 'rgba(255, 77, 77, 0.10)',
          'blocked-border': 'rgba(255, 77, 77, 0.28)',
          pending: '#F59E0B',
          'pending-subtle': 'rgba(245, 158, 11, 0.10)',
          'pending-border': 'rgba(245, 158, 11, 0.28)',
        },
      },
    },
  },
  plugins: [],
};
