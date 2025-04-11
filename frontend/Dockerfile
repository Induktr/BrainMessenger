# Используем официальный образ Node.js LTS (Alpine для меньшего размера)
FROM node:20-alpine AS base

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем зависимости для сборки (если нужны, например, python, make, g++)
# RUN apk add --no-cache libc6-compat python3 make g++

# --- Этап Зависимостей ---
FROM base AS deps
WORKDIR /app

# Копируем package.json и lock-файл
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Устанавливаем зависимости с помощью npm (или yarn/pnpm)
# Используем --legacy-peer-deps, если были конфликты
RUN npm install --legacy-peer-deps
# Или, если yarn работал лучше:
# RUN yarn install --frozen-lockfile --ignore-optional

# --- Этап Сборки ---
FROM base AS builder
WORKDIR /app

# Копируем зависимости из предыдущего этапа
COPY --from=deps /app/node_modules ./node_modules
# Копируем остальной код приложения
COPY . .

# Устанавливаем переменные окружения для сборки (если нужны)
# ENV NEXT_TELEMETRY_DISABLED 1

# Собираем приложение Next.js
RUN npm run build

# --- Этап Production ---
FROM base AS runner
WORKDIR /app

# Устанавливаем production окружение
ENV NODE_ENV production
# Отключаем телеметрию Next.js (рекомендуется)
ENV NEXT_TELEMETRY_DISABLED 1

# Создаем пользователя с ограниченными правами
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем собранные файлы из этапа Сборки
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Устанавливаем пользователя nextjs
USER nextjs

# Открываем порт, на котором будет работать приложение Next.js (по умолчанию 3000)
EXPOSE 4000

# Устанавливаем порт для приложения
ENV PORT 4000

# Команда для запуска приложения Next.js в production режиме
CMD ["node", "server.js"]