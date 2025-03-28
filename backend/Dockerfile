# Используем официальный образ Node.js LTS (Alpine для меньшего размера)
FROM node:20-alpine AS development

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /usr/src/app

# Копируем package.json и package-lock.json (или yarn.lock)
# Используем wildcard, чтобы скопировать и lock-файл, если он есть
COPY package*.json ./

# Устанавливаем зависимости
# Используем --only=development, чтобы установить devDependencies для сборки
RUN npm install --only=development

# Копируем остальной код приложения
COPY . .

# Собираем приложение (компиляция TypeScript в JavaScript)
RUN npm run build

# --- Этап Production ---
FROM node:20-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

# Устанавливаем только production-зависимости
RUN npm install --only=production

# Копируем собранное приложение из этапа development
COPY --from=development /usr/src/app/dist ./dist
# Копируем Prisma schema для генерации клиента во время выполнения (если нужно)
COPY --from=development /usr/src/app/prisma ./prisma
# Копируем сгенерированную схему GraphQL (если она используется напрямую)
COPY --from=development /usr/src/app/schema.gql ./schema.gql

# Открываем порт, на котором будет работать приложение (мы изменили на 4000)
EXPOSE 4000

# Команда для запуска приложения
# Запускаем миграции Prisma перед стартом (если они используются)
# CMD ["npx", "prisma", "migrate", "deploy", "&&", "node", "dist/main"]
CMD ["node", "dist/main"]