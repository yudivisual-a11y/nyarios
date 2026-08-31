/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#18191d',
          surface: '#1e2025',
          card: '#23262c',
          elevated: '#282b33',
          sunken: '#141518',
          border: 'rgba(255, 255, 255, 0.05)',
        },
        coral: {
          50: '#fff1f1',
          100: '#ffe1e1',
          200: '#ffc7c7',
          300: '#ffa0a0',
          400: '#ff6b6b',
          500: '#ff4b4b',
          600: '#e63939',
          700: '#c52828',
          800: '#a22424',
          900: '#862424',
          950: '#490d0d',
        },
        brand: {
          primary: '#ff4b4b',
          'primary-dark': '#e63939',
          'primary-light': '#ff6b6b',
          surface: '#18191d',
          card: '#1e2025',
          panel: '#23262c',
          sunken: '#141518',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'soft': '8px',
        'subtle': '12px',
        'card': '16px',
        'bubble': '20px',
        'panel': '28px',
      },
      boxShadow: {
        'neu-flat': '6px 6px 14px rgba(0, 0, 0, 0.55), -4px -4px 10px rgba(255, 255, 255, 0.03)',
        'neu-raised': '5px 5px 12px rgba(0, 0, 0, 0.5), -3px -3px 8px rgba(255, 255, 255, 0.04)',
        'neu-raised-sm': '3px 3px 8px rgba(0, 0, 0, 0.45), -2px -2px 6px rgba(255, 255, 255, 0.03)',
        'neu-inset': 'inset 4px 4px 8px rgba(0, 0, 0, 0.6), inset -2px -2px 6px rgba(255, 255, 255, 0.03)',
        'neu-coral': '4px 4px 12px rgba(255, 75, 75, 0.35), -2px -2px 6px rgba(255, 255, 255, 0.1)',
        'neu-dock': '0 -6px 20px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.06)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'slide-up': 'slideUp 0.25s ease-out forwards',
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
