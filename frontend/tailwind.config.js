/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#05070D',
        'glass-card': 'rgba(255, 255, 255, 0.07)',
        'glass-bar': 'rgba(255, 255, 255, 0.08)',
        'glass-inset': 'rgba(255, 255, 255, 0.06)',
        'glass-pill': 'rgba(255, 255, 255, 0.12)',
        action: 'rgba(10, 113, 227, 0.88)',
        'action-solid': '#0071E3',
        'blue-focus': '#0A84FF',
        'text-primary': '#F5F5F7',
        'text-secondary': '#A1A1A6',
        'text-tertiary': '#8E8E93',
        success: '#30D158',
        'success-bg': 'rgba(48, 209, 88, 0.14)',
        warning: '#FF9F0A',
        'warning-bg': 'rgba(255, 159, 10, 0.12)',
        error: '#FF453A',
        'error-bg': 'rgba(255, 69, 58, 0.12)',
        orb: {
          blue: '#0A3A7A',
          teal: '#12475C',
          indigo: '#3A2F63',
        },
      },
      borderRadius: {
        sheet: '28px',
        card: '20px',
        control: '12px',
        pill: '999px',
      },
      boxShadow: {
        'glass-card': 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 8px 32px rgba(0, 0, 0, 0.32)',
        'blue-ring': '0 0 0 3px rgba(10, 132, 255, 0.2)',
        'btn-primary': 'inset 0 1px 0 rgba(255, 255, 255, 0.35)',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      transitionTimingFunction: {
        apple: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
