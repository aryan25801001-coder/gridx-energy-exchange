import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a1a1a',
        secondary: '#0d1117',
        accent: '#00ff00',
        danger: '#ff0000',
        warning: '#ffff00',
        success: '#00ff00',
        neon: {
          green: '#00ff00',
          yellow: '#ffff00',
          red: '#ff0000',
          cyan: '#00ffff',
          pink: '#ff00ff',
        },
      },
      boxShadow: {
        glow: '0 0 20px rgba(0, 255, 0, 0.5)',
        'glow-red': '0 0 20px rgba(255, 0, 0, 0.5)',
        'glow-yellow': '0 0 20px rgba(255, 255, 0, 0.5)',
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        blink: 'blink 1s infinite',
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0.3' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
