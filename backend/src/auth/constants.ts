import * as dotenv from 'dotenv';
dotenv.config(); // Убедимся, что переменные окружения загружены

export const jwtConstants = {
  // Используем переменную окружения или дефолтное значение (менее безопасно)
  secret: process.env.JWT_SECRET || 'your-default-fallback-secret-key',
};

// Важно: Убедитесь, что JWT_SECRET задан в вашем .env файле!
// Например: JWT_SECRET=ва_очень_длинный_и_сложный_секретный_ключ
