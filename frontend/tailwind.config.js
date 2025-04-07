const { Height } = require('@mui/icons-material');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Основные цвета
        primary: {
          light: '#F2F047',
          DEFAULT: '#1ED94F',
          gradient: {
            from: '#F2F047',
            to: '#1ED94F',
            // Альтернативный градиент из примеров
            alt: {
              from: '#A7F43A',
              to: '#00C853',
            }
          }
        },
        accent: {
          DEFAULT: '#FF6347',
        },
        secondary: {
          DEFAULT: '#00BFFF',
        },
        success: {
          DEFAULT: '#96C93D',
        },
        
        // Фоновые цвета
        background: {
          light: '#FFFFFF',
          dark: '#1A1A1A',
        },
        surface: {
          light: '#F0F0F0',
          dark: '#333333',
        },
        
        // Текстовые цвета
        textPrimary: {
          light: '#333333',
          dark: '#FFFFFF',
        },
        textSecondary: {
          light: '#4D4D4D',
          dark: '#B0B0B0',
        },
        
        // Служебные цвета
        disabled: {
          light: '#B0B0B0',
          dark: '#4D4D4D',
        },
        border: {
          light: '#E8E8D9',
          dark: '#B0B0B0',
        },
        
        // Дополнительные цвета из примеров
        unread: {
          background: '#ECEFF1',
          border: '#FFD600',
        },
        error: {
          text: '#F44336',
          background: '#1C2526',
        },
        premium: {
          gold: '#FFD600',
          blue: '#2196F3',
        },
        focus: '#007BFF',
      },
      // Добавляем градиенты для использования
      backgroundImage: {
        'primary-gradient': 'linear-gradient(90deg, var(--tw-gradient-stops))',
        'primary-gradient-alt': 'linear-gradient(90deg, #A7F43A, #00C853)',
      },
      // Добавляем шрифты из документа дизайна
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
      },
      // Добавляем размеры шрифтов из документа дизайна
      fontSize: {
        h1: '24px',
        h2: '20px',
        body: '16px',
        caption: '14px',
        button: '16px',
      },
      scale: {
        w: {
          '24': '24px',
          "100": "100px",
        },
        h: {
          '24': '24px',
        },
      }
    },
  },
  plugins: [],
}