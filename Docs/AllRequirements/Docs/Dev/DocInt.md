# Документация интеграций BrainMessenger

### 1. Введение

**Название проекта:** BrainMessenger

**Описание:** Документ описывает интеграцию BrainMessenger с внешними сервисами, включая Neon для управления базой данных PostgreSQL и Cloudflare R2 для облачного хранения файлов.

**Цель:** Обеспечить масштабируемое хранение данных и файлов, упростить доступ к базе данных и оптимизировать работу с медиа-контентом.

---

### 2. Обзор интеграций

| Сервис | Назначение | Основные функции |
| --- | --- | --- |
| Neon | Управление PostgreSQL | Хостинг базы данных, доступ через Prisma |
| Cloudflare R2 | Облачное хранилище | Хранение файлов (фото, видео, документы, зашифрованные данные) |
| Firebase | Уведомления | Push-уведомления для пользователей |
| Stripe | Платежи | Управление подписками |
| Gmail API | Отправка кодов подтверждения | Поддержка аутентификации и 2FA |

---

### 3. Интеграция с Neon

#### 3.1. Общая информация

- **Описание:** Neon — это управляемая платформа для PostgreSQL, которая используется для хранения метаданных пользователей, чатов и сообщений.
- **Преимущества:**
  - Простое управление PostgreSQL с бесплатным тарифом (30 ГБ).
  - Высокая производительность и автоматическая репликация.
  - Удобная интеграция с Prisma для работы с базой данных.

#### 3.2. Конфигурация

1. **Регистрация в Neon:**
   - Создайте аккаунт на `https://neon.tech`.
   - Создайте новый проект в консоли Neon.
2. **Настройка базы данных:**
   - Neon автоматически предоставляет PostgreSQL-инстанс.
   - Импортируйте схему базы данных из `database/schema.sql` (см. Техническую документацию).
3. **Переменные окружения:** Добавьте в `.env`:
   ```env
   NEON_DATABASE_URL=postgresql://user:password@neon-host:port/dbname
   ```
   - Получите строку подключения из консоли Neon (Settings → Connection Details).
4. **Подключение backend:**
   - Используйте Prisma в NestJS для работы с базой данных:
     ```typescript
     import { PrismaService } from 'nestjs-prisma'

     @Module({
       providers: [PrismaService],
     })
     export class AppModule {}
     ```

#### 3.3. Методы и сценарии

- **Регистрация пользователя:**
  - Используйте Prisma для добавления пользователя:
    ```typescript
    @Injectable()
    class AuthService {
      constructor(private prisma: PrismaService) {}

      async signUp(email: string, password: string) {
        return this.prisma.user.create({
          data: { email, password },
        })
      }
    }
    ```
  - Результат: Пользователь добавлен в таблицу `users`.
- **Получение чатов:**
  - Запрос через Prisma:
    ```typescript
    async getChats(userId: string) {
      return this.prisma.chat.findMany({
        where: { userId },
        select: { id: true, name: true, type: true },
      })
    }
    ```
- **Хранение сообщений:** Сообщения сохраняются в таблицу `messages` через Prisma:
  ```typescript
  async createMessage(chatId: string, content: string, userId: string) {
    return this.prisma.message.create({
      data: { chatId, content, userId },
    })
  }
  ```

#### 3.4. Обработка ошибок

- **Connection Error:** Ошибка подключения к Neon → Проверьте `NEON_DATABASE_URL`.
- **Rate Limit Exceeded:** Превышен лимит запросов → Увеличьте план в Neon.

---

### 4. Интеграция с Cloudflare R2

#### 4.1. Общая информация

- **Описание:** Cloudflare R2 используется для хранения файлов (фото, видео, документы, зашифрованные данные), отправляемых пользователями в чатах.
- **Преимущества:**
  - Бесплатный тариф (10 ГБ), затем $0.015/ГБ.
  - Отсутствие платы за исходящий трафик.
  - Высокая производительность благодаря глобальной сети Cloudflare.

#### 4.2. Конфигурация

1. **Создание бакета:**
   - Войдите в Cloudflare Dashboard → R2 → **Create Bucket**.
   - Название: `brainmessenger-files` (уникальное).
   - Настройки: Включите шифрование в покое и ограничьте публичный доступ.
2. **Ключи доступа:**
   - Создайте API-токен в Cloudflare Dashboard → R2 → API Tokens.
   - Получите `Access Key ID` и `Secret Access Key`.
3. **Переменные окружения:** Добавьте в `.env`:
   ```env
   R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
   R2_ACCESS_KEY=your-access-key
   R2_SECRET_KEY=your-secret-key
   ENCRYPTION_KEY=your-32-byte-encryption-key
   R2_BUCKET=brainmessenger-files
   ```

#### 4.3. Методы и сценарии

- **Загрузка файла:**
  - Используйте `@aws-sdk/client-s3` в NestJS для работы с Cloudflare R2:
    ```typescript
    import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
    import { createCipheriv, randomBytes } from 'crypto'

    @Injectable()
    class StorageService {
      private r2 = new S3Client({
        region: 'auto',
        endpoint: process.env.R2_ENDPOINT,
        credentials: { accessKeyId: process.env.R2_ACCESS_KEY, secretAccessKey: process.env.R2_SECRET_KEY },
      })

      private encrypt(data: string): { encrypted: string, iv: string } {
        const iv = randomBytes(16)
        const cipher = createCipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY), iv)
        let encrypted = cipher.update(data, 'utf8', 'hex')
        encrypted += cipher.final('hex')
        return { encrypted, iv: iv.toString('hex') }
      }

      async uploadFile(file: Buffer, fileName: string) {
        const params = {
          Bucket: process.env.R2_BUCKET,
          Key: `uploads/${fileName}`,
          Body: file,
        }
        await this.r2.send(new PutObjectCommand(params))
        return `https://r2.brainmessenger.com/uploads/${fileName}`
      }

      async storeSensitiveData(userId: string, email: string, password: string) {
        const encryptedEmail = this.encrypt(email)
        const encryptedPassword = this.encrypt(password)

        const params = {
          Bucket: process.env.R2_BUCKET,
          Key: `sensitive/${userId}/metadata.json`,
          Body: JSON.stringify({
            email: encryptedEmail.encrypted,
            emailIv: encryptedEmail.iv,
            password: encryptedPassword.encrypted,
            passwordIv: encryptedPassword.iv,
          }),
        }
        await this.r2.send(new PutObjectCommand(params))
        return `https://r2.brainmessenger.com/sensitive/${userId}/metadata.json`
      }
    }
    ```
  - Результат: Файл сохранён в R2, URL возвращён для хранения в PostgreSQL.
- **Получение файла:**
  - Генерация URL (R2 использует прямые ссылки, так как публичный доступ ограничен):
    ```typescript
    const url = `https://r2.brainmessenger.com/uploads/${fileName}`
    ```
  - Для доступа используйте токены или ограничьте доступ через политики R2.
- **Сценарий:** Пользователь отправляет фото в чат → Файл загружается в R2, URL сохраняется в таблице `messages`.

#### 4.4. Обработка ошибок

- **403 Forbidden:** Неверные ключи → Проверьте `R2_ACCESS_KEY` и `R2_SECRET_KEY`.
- **404 Not Found:** Файл отсутствует → Убедитесь в правильности пути.
- **429 Too Many Requests:** Превышен лимит → Оптимизируйте запросы или увеличьте план.

---

### 5. Взаимодействие Neon и Cloudflare R2

- **Сценарий:**
  1. Пользователь отправляет файл через чат.
  2. Backend (NestJS) загружает файл в Cloudflare R2 и получает URL.
  3. URL сохраняется в PostgreSQL через Prisma:
     ```typescript
     @Injectable()
     class ChatService {
       constructor(
         private prisma: PrismaService,
         private storageService: StorageService
       ) {}

       async sendFile(chatId: string, userId: string, file: Buffer, fileName: string) {
         const fileUrl = await this.storageService.uploadFile(file, fileName)
         return this.prisma.message.create({
           data: {
             chatId,
             userId,
             content: 'File',
             fileUrl,
           },
         })
       }
     }
     ```
- **Преимущества:**
  - Neon управляет структурированными данными (сообщения, пользователи).
  - Cloudflare R2 хранит неструктурированные данные (файлы, зашифрованные данные).

---

### 6. Другие интеграции

#### 6.1. Firebase

- **Назначение:** Push-уведомления.
- **Конфигурация:**
  - Переменная: `FIREBASE_CREDENTIALS_PATH`.
  - Пример: Отправка уведомления через `firebase-admin`.

#### 6.2. Stripe

- **Назначение:** Управление подписками.
- **Конфигурация:**
  - Переменная: `STRIPE_SECRET_KEY`.
  - Пример: Создание сессии оплаты через `stripe.checkout.sessions.create`.

#### 6.3. Gmail API

- **Назначение:** Коды подтверждения для 2FA.
- **Конфигурация:** См. Техническую документацию (стр. 4-5).

---

### 7. Рекомендации

- **Безопасность:**
  - Используйте переменные окружения для ключей.
  - Настройте ротацию JWT и R2 API-токенов.
- **Масштабирование:**
  - Neon: Перейдите на платный план при росте нагрузки (например, $150/месяц за 113 ГБ).
  - Cloudflare R2: Используйте автоматическое масштабирование (10 ГБ бесплатно, затем $0.015/ГБ).
- **Мониторинг:**
  - Отслеживайте затраты на R2 и лимиты Neon через их консоли.