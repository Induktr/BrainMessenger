# Руководство по разработке BrainMessenger

### 1. Введение

**Название проекта:** BrainMessenger

**Описание:** Руководство описывает структуру проекта, стандарты кодирования, используемые инструменты, процессы разработки и подходы к оптимизации для BrainMessenger — мессенджера с поддержкой чатов, звонков и AI-интеграций на платформах Android, Windows и веб.

**Цель:** Обеспечить единый подход к разработке, упростить подключение новых разработчиков, поддерживать масштабируемость проекта и оптимизировать производительность.

**Аудитория:** Frontend-, backend- и DevOps-разработчики.

---

### 2. Структура репозитория

Проект организован как **монорепозиторий** с использованием Turborepo для управления несколькими пакетами (мобильное приложение, десктопное приложение, веб-приложение, общий код и бэкенд). Это позволяет переиспользовать код между платформами и упрощает управление зависимостями.

```
BrainMessenger/
├── packages/
│   ├── core/                  # Общий код (логика, API-клиент, утилиты)
│   │   ├── src/
│   │   │   ├── api/          # Apollo Client для GraphQL
│   │   │   ├── hooks/        # Общие хуки (useChats, useTheme)
│   │   │   └── utils/        # Утилиты (форматирование, валидация)
│   │   └── package.json
│   ├── mobile-desktop/        # Приложение для Android и Windows (React Native)
│   │   ├── src/
│   │   │   ├── components/   # Компоненты (ChatList, MessageBubble)
│   │   │   ├── screens/      # Экраны (WelcomeScreen, ChatScreen)
│   │   │   ├── theme/        # Темы (LightMode, DarkMode)
│   │   │   └── platform/     # Платформо-специфичный код
│   │   │       ├── android/  # Кастомизации для Android
│   │   │       └── windows/  # Кастомизации для Windows
│   │   ├── android/          # Нативная часть для Android
│   │   ├── windows/          # Нативная часть для Windows
│   │   ├── assets/           # Статические файлы (иконки, звуки)
│   │   └── package.json
│   └── web/                   # Веб-приложение (Next.js)
│       ├── pages/            # Страницы (index.tsx, chat/[id].tsx)
│       ├── components/       # Компоненты (адаптированные для веба)
│       ├── styles/           # Стили (Tailwind CSS)
│       └── package.json
├── backend/                   # Серверная часть (NestJS)
│   ├── src/                  # Исходный код
│   ├── test/                 # Тесты
│   └── package.json          # Зависимости backend
├── infrastructure/            # Инфраструктура (Terraform, Kubernetes)
│   ├── k8s/                  # Манифесты Kubernetes
│   └── main.tf               # Terraform-конфигурация
├── docs/                      # Документация проекта
├── turbo.json                 # Конфигурация Turborepo
└── .env.example               # Пример переменных окружения

```

- **core:** Общий код (логика, API-клиент, хуки), переиспользуемый между платформами.
- **mobile-desktop:** Приложение для Android и Windows (React Native).
- **web:** Веб-приложение (Next.js).
- **backend:** Логика API, интеграции (Nhost, AWS S3, Firebase).
- **infrastructure:** Настройка серверов и кластера.

---

### 3. Технологический стек

| Компонент | Технология | Версия | Назначение |
| --- | --- | --- | --- |
| Frontend: Mobile | React Native | 0.72+ | UI для Android |
| Frontend: Desktop | React Native for Windows | 0.72+ | UI для Windows |
| Frontend: Web | Next.js, Tailwind CSS | 14.x | Веб-приложение с SSR/SSG и стилизацией |
| Frontend: Общее | TypeScript | 5.x | Строгая типизация для всех платформ |
| Backend | NestJS | 10.x | GraphQL API, бизнес-логика |
| ORM | Prisma | 5.x | Работа с базой данных (PostgreSQL) |
| База данных | PostgreSQL (Nhost) | 15.x | Хранение данных пользователей |
| Хранилище | AWS S3 | - | Файлы (медиа, документы, звуки) |
| Кэширование | Redis | 7.x | Лимиты, временные данные |
| Асинхронность | Kafka | 3.x | Фоновые задачи (обработка изображений) |
| Оркестрация | Kubernetes | 1.24+ | Масштабирование серверов |
| Инфраструктура | Terraform | 1.5+ | Автоматизация деплоя |
| Тестирование | Jest, Cypress, Detox | - | Модульные, интеграционные и E2E-тесты |
| Профилирование | V8 Profiler, Chrome DevTools | - | Анализ производительности backend |
| Мониторинг Kafka | Kafdrop | - | Мониторинг топиков и сообщений |

---

### 4. Стандарты кодирования

### 4.1. Общие принципы

- Следуйте принципам **DRY** (Don’t Repeat Yourself) и **KISS** (Keep It Simple, Stupid).
- Используйте английский язык для названий переменных, функций и комментариев.
- Комментарии обязательны для сложной логики (например, шифрование, интеграции, работа с множествами).

### 4.2. Конвенции именования

- **Переменные и функции:** camelCase
    - Пример: `getUserProfile`, `userId`.
- **Классы и модули:** PascalCase
    - Пример: `UserService`, `AuthModule`.
- **Константы:** UPPER_CASE
    - Пример: `MAX_FILE_SIZE`.
- **Файлы:** kebab-case
    - Пример: `user-service.ts`, `chat-screen.tsx`.
- **API endpoints:** REST-style в GraphQL (например, `getUser`, `sendMessage`).

### 4.3. Форматирование

- Используйте **Prettier** для автоматического форматирования:
    - Настройки: `.prettierrc` (2 пробела, без точек с запятой).
        
        ```json
        {
          "tabWidth": 2,
          "semi": false,
          "singleQuote": true
        }
        
        ```
        
- Линтинг: **ESLint** с конфигурацией Airbnb.

### 4.4. Структура кода

- **Core (общий код):**
    - API-клиент: `/packages/core/src/api/index.ts`.
    - Хуки: `/packages/core/src/hooks/useAuth.ts`.
    - Утилиты: `/packages/core/src/utils/formatDate.ts`.
- **Mobile-Desktop (React Native):**
    - Компоненты: `/packages/mobile-desktop/src/components/Button.tsx`.
    - Экраны: `/packages/mobile-desktop/src/screens/ChatScreen.tsx`.
    - Хуки: `/packages/mobile-desktop/src/hooks/useChat.ts`.
- **Web (Next.js):**
    - Страницы: `/packages/web/pages/index.tsx`.
    - Компоненты: `/packages/web/components/ChatList.tsx`.
    - Стили: `/packages/web/styles/tailwind.css`.
- **Backend (NestJS):**
    - Модули: `/backend/src/auth/auth.module.ts`.
    - Сервисы: `/backend/src/user/user.service.ts`.
    - Резолверы: `/backend/src/chat/chat.resolver.ts`.

---

### 5. Используемые библиотеки

### 5.1. Core (общий код)

- @apollo/client — GraphQL-запросы к Nhost, переиспользуемые на всех платформах.

### 5.2. Mobile-Desktop (React Native)

- @react-navigation/native — Навигация между экранами.
- react-native-sound — Воспроизведение звуков (см. Документацию звуков).

### 5.3. Web (Next.js)

- next — Фреймворк для веб-приложения (SSR/SSG).
- tailwindcss — Утилитарная стилизация компонентов.
- @apollo/client — GraphQL-запросы (переиспользуется из core).

### 5.4. Backend

- @nestjs/graphql — GraphQL API.
- @nestjs/prisma — Интеграция с Prisma для работы с базой данных.
- @nestjs/jwt — Аутентификация через JWT.
- aws-sdk — Работа с AWS S3.
- @nhost/nhost-js — Интеграция с Nhost.

### 5.5. Общие

- winston — Логирование (см. Руководство по мониторингу).
- @sentry/node — Отслеживание ошибок.
- core-js — Полифиллы для новых методов (например, Set из ECMAScript 2024).

### 5.6. Работа с множествами (Set)

BrainMessenger использует объект `Set` для управления уникальными данными, такими как списки чатов, уведомлений, активных звонков и прав доступа. Начиная с ECMAScript 2024, доступны новые методы для упрощения операций с множествами. Эти методы должны использоваться в соответствии с их назначением для повышения читаемости, производительности и безопасности кода.

- **Для операций с множествами:**
    - `union(s2)`: Объединить два множества (например, списки чатов).
        
        ```tsx
        const userChats = new Set([1, 2, 3])
        const groupChats = new Set([3, 4, 5])
        const allChats = userChats.union(groupChats) // [1, 2, 3, 4, 5]
        
        ```
        
    - `intersection(s2)`: Найти общие элементы (например, общие участники чатов).
        
        ```tsx
        const commonChats = userChats.intersection(groupChats) // [3]
        
        ```
        
    - `difference(s2)`: Найти уникальные элементы (например, для синхронизации).
        
        ```tsx
        const uniqueUserChats = userChats.difference(groupChats) // [1, 2]
        
        ```
        
- **Для проверок отношений:**
    - `isSubsetOf(s2)`: Проверить, является ли одно множество подмножеством другого (например, для прав доступа).
        
        ```tsx
        const userPermissions = new Set(['read', 'write'])
        const requiredPermissions = new Set(['read'])
        const hasAccess = requiredPermissions.isSubsetOf(userPermissions) // true
        
        ```
        
    - `isDisjointFrom(s2)`: Проверить, нет ли общих элементов (например, для проверки конфликтов прав).
        
        ```tsx
        const userPermissions = new Set(['read', 'write'])
        const forbiddenPermissions = new Set(['delete'])
        const isSafe = userPermissions.isDisjointFrom(forbiddenPermissions) // true
        
        ```
        
- **Для управления элементами:**
    - `add(value)`, `delete(value)`, `has(value)`: Используйте для добавления, удаления и проверки элементов.
        
        ```tsx
        const activeNotifications = new Set<number>()
        activeNotifications.add(1) // Добавить уведомление
        if (activeNotifications.has(1)) {
          console.log('Уведомление активно')
        }
        activeNotifications.delete(1) // Удалить уведомление
        
        ```
        
- **Рекомендации:**
    - Используйте декларативные методы (`union`, `intersection`, `difference`) вместо ручных реализаций через циклы, так как они более читаемы и оптимизированы.
    - Экономьте память: Если вам не нужно новое множество, используйте `has` и циклы вместо создания новых множеств (например, вместо `intersection` для проверки наличия общих элементов).
    - Совместимость: Убедитесь, что среда выполнения (Node.js 22+, Chrome 122+) поддерживает новые методы. Для старых сред используйте полифиллы (`core-js/proposals/set-methods-v2`).
    - Типизация: В TypeScript указывайте типы для `Set` (например, `Set<number>`), чтобы избежать ошибок.
        
        ```tsx
        const chats: Set<number> = new Set([1, 2, 3])
        
        ```
        

---

### 6. Процесс разработки

### 6.1. Установка окружения

1. Клонируйте репозиторий:
    
    ```bash
    git clone <https://github.com/xAI/BrainMessenger.git>
    cd BrainMessenger
    
    ```
    
2. Установите зависимости:
    
    ```bash
    npm install # Устанавливает зависимости для всех пакетов через Turborepo
    
    ```
    
3. Скопируйте `.env.example` в `.env` и заполните переменные (см. Руководство по развертыванию).

### 6.2. Локальный запуск

- **Backend:**
    
    ```bash
    cd backend
    npm run start:dev
    
    ```
    
- **Mobile-Desktop (React Native):**
    
    ```bash
    cd packages/mobile-desktop
    npm run android  # или npm run windows
    
    ```
    
- **Web (Next.js):**
    
    ```bash
    cd packages/web
    npm run dev
    
    ```
    

### 6.3. Коммиты и ветки

- **Формат коммитов:** Conventional Commits
    - Пример: `feat(chat): add message sending`, `fix(auth): resolve JWT expiration`.
- **Ветки:**
    - `main` — стабильная версия.
    - `develop` — текущая разработка.
    - `feature/<name>` — новые функции (например, `feature/ai-assistant`).
    - `fix/<name>` — исправления (например, `fix/bug-123`).

### 6.4. Pull Request (PR) и код-ревью

- Создавайте PR из feature/fix веток в `develop`.
- Требования к PR:
    - Описание задачи и изменений.
    - Ссылка на задачу в Jira (например, `BM-123`).
    - Прохождение тестов (`npm test`).
- Код-ревью: Минимум 1 аппрув от другого разработчика.

### 6.5. Тестирование

- Запуск тестов:
    
    ```bash
    npm run test  # Запускает тесты для всех пакетов через Turborepo
    
    ```
    
- Используйте Jest для модульных тестов, Cypress для веб, Detox для мобильных (см. Руководство по тестированию).

---

### 7. Рекомендации по разработке

### 7.1. Core (общий код)

- **API-клиент:** Используйте Apollo Client с кэшированием запросов.
    
    typescript
    
    СвернутьПереносКопировать
    
    `import { ApolloClient, InMemoryCache } from '@apollo/client'
    export const client = new ApolloClient({
      uri: process.env.API_GATEWAY_URL,
      cache: new InMemoryCache(),
    })`
    
- **Хуки:** Создавайте переиспользуемые хуки (например, useTheme, useChats).

### 7.2. Mobile-Desktop (React Native)

- **Компоненты:** Делайте их переиспользуемыми и с минимальной логикой.
    - Пример: <Button title="Send" onPress={handleSend} />.
- **Звуки:** Используйте react-native-sound для воспроизведения (см. Документацию звуков).

### 7.3. Web (Next.js)

- **SEO:** Используйте SSR/SSG для страниц (например, getStaticProps).
    
    typescript
    
    СвернутьПереносКопировать
    
    `export async function getStaticProps() {
      return {
        props: { title: 'BrainMessenger - Secure Chat App' },
      }
    }`
    
- **Стили:** Используйте Tailwind CSS для утилитарной стилизации.
    
    typescript
    
    СвернутьПереносКопировать
    
    `<div className="bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold">Welcome to BrainMessenger</h1>
    </div>`
    

### 7.4. Backend

- **GraphQL:** Оптимизируйте резолверы, избегайте N+1 запросов (см. "Руководство по оптимизации BrainMessenger").
- **Prisma:** Используйте Prisma для работы с базой данных.
    
    typescript
    
    СвернутьПереносКопировать
    
    `import { PrismaService } from 'nestjs-prisma'
    
    @Injectable()
    class UserService {
      constructor(private prisma: PrismaService) {}
    
      async getUser(email: string) {
        return this.prisma.user.findUnique({ where: { email } })
      }
    }`
    
- **Интеграции:**
    - Nhost: Используйте @nhost/nhost-js для авторизации и запросов.
    - AWS S3: Загружайте файлы асинхронно с aws-sdk.
- **Ошибки:** Логируйте через Winston, отправляйте в Sentry (см. Руководство по мониторингу).

### 7.5. Безопасность

- Не коммитьте ключи в Git — используйте .env.
- Шифруйте чувствительные данные перед сохранением (см. Руководство по безопасности).
- Используйте Prisma для безопасных запросов (см. Руководство по безопасности).

---

### 8. Оптимизация проекта

Оптимизация — это итеративный процесс:

1. **Измерение:** Определите узкие места (bottlenecks) с помощью профилирования и мониторинга.
2. **Оптимизация:** Примените конкретные техники или инструменты.
3. **Повторное измерение:** Убедитесь, что оптимизация дала эффект и не вызвала регрессий.

### 8.1. Обработка и оптимизация изображений

**Библиотека:** `sharp` (на базе libvips)

**Почему:** Быстрее и менее ресурсоёмко, чем ImageMagick, с отличной интеграцией в Node.js.

**Области применения:** Обработка загрузок пользователей (аватары, изображения в чатах).

**Шаги по использованию:**

1. Установите:
Убедитесь, что `libvips` установлен (особенно в Docker).
    
    ```bash
    npm install sharp
    
    ```
    
2. Создайте сервис в NestJS:
    
    ```tsx
    @Injectable()
    class ImageProcessingService {
      async processImage(buffer: Buffer, width: number, height: number) {
        return sharp(buffer)
          .resize(width, height, { withoutEnlargement: true })
          .webp({ quality: 80 })
          .withMetadata({ orientation: true }) // Удаление EXIF, кроме ориентации
          .toBuffer()
      }
    }
    
    ```
    
3. Интеграция в контроллер:
    
    ```tsx
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
      const processedImage = await this.imageProcessingService.processImage(file.buffer, 300, 300)
      // Сохранение в AWS S3
    }
    
    ```
    
4. Асинхронность: Вынесите обработку в фоновые задачи через Kafka (см. раздел 8.7).

**Совет:** Всегда удаляйте EXIF-метаданные для экономии размера.

### 8.2. Оптимизация базы данных (Nhost/PostgreSQL)

**Подход 1: Индексация**

**Почему:** Ускоряет запросы `SELECT`, `JOIN`, `WHERE`, `ORDER BY`.

**Области применения:** Поля для поиска (например, `userId`, `chatId`, `email`).

**Шаги:**

1. Добавьте индексы в `schema.prisma`:
    
    ```
    model Message {
      id        String   @id @default(cuid())
      content   String
      createdAt DateTime @default(now())
      chatId    String
      userId    String
      chat      Chat     @relation(fields: [chatId], references: [id])
      user      User     @relation(fields: [userId], references: [id])
    
      @@index([chatId, createdAt])
      @@index([userId])
    }
    
    ```
    
2. Примените миграцию:
    
    ```bash
    npx prisma migrate dev --name add_message_indices
    
    ```
    
3. Анализируйте запросы с помощью `EXPLAIN ANALYZE` через SQL-клиент Nhost.

**Подход 2: Оптимизация запросов (Prisma)**

**Почему:** Снижает нагрузку на базу данных.

**Шаги:**

- Выбирайте только нужные поля:
    
    ```tsx
    const chats = await prisma.chat.findMany({
      where: { userId: ctx.userId },
      select: { id: true, name: true },
    })
    
    ```
    
- Избегайте N+1: Используйте `include` для связей.
- Пагинация: Используйте `skip`, `take`, `cursor` для списков.

**Подход 3: Prisma Accelerate**

**Почему:** Глобальный кеш запросов и пул соединений.

**Шаги:** Настройте Prisma Accelerate (см. документацию Prisma).

### 8.3. Оптимизация GraphQL API (NestJS + Prisma)

**Инструмент 1: DataLoader**

**Почему:** Решает проблему N+1 запросов в GraphQL.

**Шаги:**

1. Установите:
    
    ```bash
    npm install dataloader
    
    ```
    
2. Создайте лоадер:
    
    ```tsx
    @Injectable({ scope: Scope.REQUEST })
    class UserLoader {
      private loader = new DataLoader(async (ids: string[]) => {
        const users = await this.prisma.user.findMany({ where: { id: { in: ids } } })
        return ids.map(id => users.find(user => user.id === id))
      })
    
      constructor(private prisma: PrismaService) {}
    
      load(id: string) {
        return this.loader.load(id)
      }
    }
    
    ```
    
3. Используйте в резолверах:
    
    ```tsx
    @ResolveField()
    async user(@Parent() message: Message, @Context() { loaders }: { loaders: { userLoader: UserLoader } }) {
      return loaders.userLoader.load(message.userId)
    }
    
    ```
    

**Инструмент 2: Анализ сложности запросов**

**Библиотека:** `graphql-query-complexity`

**Почему:** Защищает API от "тяжёлых" запросов.

**Шаги:**

1. Установите:
    
    ```bash
    npm install graphql-query-complexity
    
    ```
    
2. Настройте в NestJS:
    
    ```tsx
    const complexityPlugin = new QueryComplexityPlugin({
      maximumComplexity: 100,
      estimators: [fieldExtensionsEstimator(), simpleEstimator({ defaultComplexity: 1 })],
    })
    
    ```
    

**Подход 3: Persisted Queries**

**Почему:** Уменьшает размер запросов и улучшает кеширование.

**Шаги:** Настройте Apollo Client и Server для поддержки persisted queries, используйте Redis для хранения запросов.

### 8.4. Оптимизация backend логики (NestJS)

**Инструмент 1: Профилирование Node.js**

**Почему:** Находит "горячие" участки кода.

**Шаги:**

1. Запустите с профилированием:
    
    ```bash
    node --prof dist/main.js
    
    ```
    
2. Нагрузите API (например, с помощью `k6`).
3. Анализируйте лог с помощью `-prof-process` или Chrome DevTools.

**Инструмент 2: Обнаружение утечек памяти**

**Библиотека:** `heapdump`

**Шаги:**

1. Установите:
    
    ```bash
    npm install heapdump
    
    ```
    
2. Сделайте снапшоты кучи:
    
    ```tsx
    import * as heapdump from 'heapdump'
    heapdump.writeSnapshot('heapdump-1.heapsnapshot')
    
    ```
    
3. Сравните в Chrome DevTools (Memory Tab).

### 8.5. Кэширование (Redis)

**Библиотека:** `ioredis`

**Паттерн:** Cache-Aside

**Почему:** Снижает нагрузку на PostgreSQL.

**Шаги:**

1. Установите:
    
    ```bash
    npm install ioredis @nestjs/cache-manager cache-manager-redis-store
    
    ```
    
2. Настройте в NestJS:
    
    ```tsx
    @Module({
      imports: [
        CacheModule.registerAsync({
          useFactory: () => ({
            store: redisStore,
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
          }),
        }),
      ],
    })
    export class AppModule {}
    
    ```
    
3. Используйте:
    
    ```tsx
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    async getUserProfile(userId: string) {
      const cacheKey = `user:profile:${userId}`
      const cached = await this.cacheManager.get(cacheKey)
      if (cached) return cached
      const user = await this.prisma.user.findUnique({ where: { id: userId } })
      await this.cacheManager.set(cacheKey, user, { ttl: 3600 })
      return user
    }
    
    ```
    
4. Инвалидация: Удаляйте ключи при обновлении данных.

### 8.6. Оптимизация push-уведомлений (Firebase FCM)

**Подход 1: Батчинг**

**Почему:** Уменьшает количество API-вызовов.

**Шаги:**

- Отправляйте до 500 уведомлений одним вызовом:
    
    ```tsx
    const tokens = ['token1', 'token2']
    await admin.messaging().sendMulticast({
      tokens,
      notification: { title: 'New Message', body: 'You have a new message' },
    })
    
    ```
    

**Подход 2: Темы (Topics)**

**Почему:** Упрощает массовые рассылки.

**Шаги:**

- Клиент подписывается:
    
    ```tsx
    FirebaseMessaging.instance.subscribeToTopic('chat_123')
    
    ```
    
- Бэкенд отправляет:
    
    ```tsx
    await admin.messaging().send({
      topic: 'chat_123',
      notification: { title: 'New Message', body: 'Group chat updated' },
    })
    
    ```
    

**Подход 3: Data Messages**

**Почему:** Даёт контроль над отображением уведомлений.

**Шаги:**

- Бэкенд отправляет:
    
    ```tsx
    await admin.messaging().send({
      token: 'device_token',
      data: { chatId: '123', messageId: '456', senderName: 'Alice' },
    })
    
    ```
    
- Клиент обрабатывает:
    
    ```tsx
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      await notifee.displayNotification({
        title: `${remoteMessage.data.senderName} sent a message`,
        body: 'Tap to view',
        data: remoteMessage.data,
      })
    })
    
    ```
    

### 8.7. Асинхронная обработка (Kafka)

**Библиотека:** `kafkajs`

**Почему:** Надёжная асинхронная обработка задач.

**Шаги:**

1. Установите:
    
    ```bash
    npm install kafkajs
    
    ```
    
2. Настройте продюсер:
    
    ```tsx
    const kafka = new Kafka({ clientId: 'brainmessenger', brokers: ['kafka:9092'] })
    const producer = kafka.producer()
    await producer.connect()
    await producer.send({
      topic: 'image-processing',
      messages: [{ key: userId, value: JSON.stringify({ filePath }) }],
    })
    
    ```
    
3. Настройте консьюмер:
    
    ```tsx
    const consumer = kafka.consumer({ groupId: 'image-workers' })
    await consumer.subscribe({ topic: 'image-processing' })
    await consumer.run({
      eachMessage: async ({ message }) => {
        const payload = JSON.parse(message.value.toString())
        // Обработка изображения
      },
    })
    
    ```
    

**Подход:** Партиционирование

- Используйте `userId` или `chatId` как ключ для сохранения порядка обработки.

**Инструмент:** Kafdrop

- Разверните Kafdrop для мониторинга топиков и сообщений:
    
    ```bash
    docker run -d --name kafdrop -p 9000:9000 obsidiandynamics/kafdrop --kafka.brokerConnect=kafka:9092
    
    ```
    

### 8.8. Оптимизация взаимодействия клиент-API-БД

**Клиент:**

- Используйте TanStack Query или Apollo Client для кэширования запросов.
    
    ```tsx
    const { data } = useQuery(['chats', userId], () => client.query({ query: GET_CHATS, variables: { userId } }))
    
    ```
    

**Сеть:**

- Включите HTTP/2 или HTTP/3 на сервере.
- Настройте сжатие (Gzip/Brotli) в NestJS:
    
    ```tsx
    app.use(compression())
    
    ```
    

### 8.9. Оптимизация аутентификации

**Подход 1: Stateless (JWT)**

- Используйте `@nestjs/jwt` с короткоживущими access-токенами и refresh-токенами.

**Подход 2: Rate Limiting**

**Библиотека:** `@nestjs/throttler`

**Шаги:**

1. Установите:
    
    ```bash
    npm install @nestjs/throttler
    
    ```
    
2. Настройте:
    
    ```tsx
    @Module({
      imports: [ThrottlerModule.forRoot({ ttl: 60, limit: 100 })],
    })
    export class AppModule {}
    
    ```
    

**Подход 3: Безопасные заголовки**

**Библиотека:** `helmet`

**Шаги:**

1. Установите:
    
    ```bash
    npm install helmet
    
    ```
    
2. Настройте:
    
    ```tsx
    app.use(helmet())
    
    ```
    

### 8.10. Оптимизация чатов (WebSocket)

**Библиотека:** NestJS Gateways (`@nestjs/websockets`)

**Шаги:**

1. Настройте WebSocket:
    
    ```tsx
    @WebSocketGateway()
    class ChatGateway {
      @SubscribeMessage('message')
      handleMessage(client: Socket, payload: { chatId: string, content: string }) {
        this.server.to(payload.chatId).emit('message', payload)
      }
    }
    
    ```
    
2. Клиент подключается:
    
    ```tsx
    const socket = io('<https://api.brainmessenger.com>')
    socket.emit('message', { chatId: '123', content: 'Hello' })
    
    ```
    

**Оптимизация:**

- Используйте бинарные форматы (например, MessagePack) вместо JSON.
- Батчинг: Буферизируйте сообщения на клиенте/сервере (например, 50 мс).

**Управление присутствием:**

- Используйте heartbeats и Redis для отслеживания статуса:
    
    ```tsx
    const setOnlineStatus = async (userId: string) => {
      await redis.set(`user:status:${userId}`, 'online', 'EX', 60)
    }
    
    ```
    

### 8.11. Оптимизация анимаций

**Mobile-Desktop (React Native):**

**Библиотека:** `react-native-reanimated`

**Шаги:**

- Используйте для плавных анимаций:
    
    ```tsx
    const progress = useSharedValue(0)
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: progress.value }],
    }))
    progress.value = withSpring(100)
    
    ```
    

**Web (Next.js):**

**Библиотека:** `framer-motion`

**Шаги:**

- Используйте для переходов:
    
    ```tsx
    import { motion } from 'framer-motion'
    const Component = () => (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Hello
      </motion.div>
    )
    
    ```
    

### 8.12. Оптимизация обработки данных в базе данных

**Подход 1: Материализованные представления**

**Почему:** Кэширует сложные запросы.

**Шаги:**

- Создайте:
    
    ```sql
    CREATE MATERIALIZED VIEW chat_stats AS
    SELECT chatId, COUNT(*) as messageCount
    FROM "Message"
    GROUP BY chatId;
    
    ```
    
- Обновляйте:
    
    ```sql
    REFRESH MATERIALIZED VIEW chat_stats;
    
    ```
    

**Подход 2: Партиционирование таблиц**

**Почему:** Ускоряет запросы для больших таблиц.

**Шаги:** Разделите таблицу `Message` по `createdAt` (например, по месяцам).

---

### 9. Процесс деплоя

- **Локально:** Используйте Docker Compose (см. Руководство по развертыванию).
- **Продакшен:**
    1. Сборка Docker-образов:
        
        ```bash
        docker build -t brainmessenger-backend ./backend
        
        ```
        
    2. Деплой в Kubernetes:
        
        ```bash
        kubectl apply -f infrastructure/k8s/
        
        ```
        
    3. Деплой веб-приложения:
        
        ```bash
        cd packages/web
        vercel deploy
        
        ```
        
    4. Проверка:
        
        ```bash
        curl <https://api.brainmessenger.com/health>
        
        ```
        

---

### 10. Полезные команды

| Команда | Описание | Расположение |
| --- | --- | --- |
| `npm run lint` | Проверка линтинга | Все пакеты |
| `npm run build` | Сборка продакшен-версии | Все пакетов |
| `npm run migrate` | Применение миграций БД (Prisma) | backend |
| `terraform apply` | Развёртывание инфраструктуры | infrastructure |
| `npm run dev` | Локальный запуск | packages/web |
| `npm run android` | Запуск Android | packages/mobile-desktop |
| `npm run windows` | Запуск Windows | packages/mobile-desktop |

---

### 10. Примечания

- **Онбординг:** Новые разработчики должны изучить Техническую документацию, Документацию дизайна и Документацию звуков перед стартом.
- **Обновления:** Стандарты могут корректироваться с ростом проекта (например, при переходе на микросервисы в Q1 2026).
- **Совместимость:** Убедитесь, что используете Node.js 22+ для поддержки новых методов Set (ECMAScript 2024).
- **Оптимизация:** Для рекомендаций по оптимизации производительности см. "Руководство по оптимизации BrainMessenger".
- **Вопросы:** Обращайтесь в Slack (#dev-team) или к техлиду.