/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#000000',
        card: '#141416',
        inset: '#1C1C1E',
        tertiary: '#2C2C2E',
        'text-primary': '#F5F5F7',
        'text-secondary': '#A1A1A6',
        'text-tertiary': '#8E8E93',
        action: '#0071E3',
        'blue-focus': '#0A84FF',
        success: '#30D158',
        'success-bg': 'rgba(48,209,88,0.14)',
        warning: '#FF9F0A',
        'warning-bg': 'rgba(255,159,10,0.12)',
        error: '#FF453A',
        'error-bg': 'rgba(255,69,58,0.12)',
        apple: {
          canvas: '#000000',
          card: '#141416',
          inset: '#1C1C1E',
          tertiary: '#2C2C2E',
          primary: '#F5F5F7',
          secondary: '#A1A1A6',
          tertiaryText: '#8E8E93',
          action: '#0071E3',
          blue: '#0A84FF',
          green: '#30D158',
          amber: '#FF9F0A',
          red: '#FF453A',
        }
      },
      borderRadius: {
        sheet: '28px',
        card: '20px',
        control: '12px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 4px 24px rgba(0, 0, 0, 0.4)',
        'blue-ring': '0 0 0 3px rgba(10, 132, 255, 0.2)',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          'system-ui',
          'sans-serif'
        ],
        mono: [
          'ui-monospace',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace'
        ]
      },
      transitionTimingFunction: {
        apple: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }
    },
  },
  plugins: [],
}
