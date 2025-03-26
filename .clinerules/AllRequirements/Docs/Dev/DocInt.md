# Документация интеграций BrainMessenger

### 1. Введение

**Название проекта:** BrainMessenger

**Описание:** Документ описывает интеграцию BrainMessenger с внешними сервисами, включая Nhost для управления базой данных PostgreSQL и AWS S3 для облачного хранения файлов.

**Цель:** Обеспечить масштабируемое хранение данных и файлов, упростить доступ к базе данных и оптимизировать работу с медиа-контентом.

---

### 2. Обзор интеграций

| Сервис | Назначение | Основные функции |
| --- | --- | --- |
| Nhost | Управление PostgreSQL | Хостинг базы данных, GraphQL API, авторизация |
| AWS S3 | Облачное хранилище | Хранение файлов (фото, видео, документы) |
| Firebase | Уведомления | Push-уведомления для пользователей |
| Stripe | Платежи | Управление подписками |
| Gmail API | Отправка кодов подтверждения | Поддержка аутентификации и 2FA |

---

### 3. Интеграция с Nhost

### 3.1. Общая информация

- **Описание:** Nhost — это платформа для упрощённого управления PostgreSQL с встроенными GraphQL API, авторизацией и хостингом. Используется для хранения данных пользователей, чатов и сообщений.
- **Преимущества:**
    - Автоматическая генерация GraphQL API на основе схемы PostgreSQL.
    - Встроенная авторизация (JWT).
    - Масштабируемость и удобство настройки.

### 3.2. Конфигурация

1. **Регистрация в Nhost:**
    - Создайте аккаунт на `https://nhost.io`.
    - Создайте новый проект в консоли Nhost.
2. **Настройка базы данных:**
    - Nhost автоматически предоставляет PostgreSQL-инстанс.
    - Импортируйте схему базы данных из `database/schema.sql` (см. Техническую документацию).
3. **Переменные окружения:** Добавьте в `.env`:
    
    ```
    NHOST_SUBDOMAIN=your-subdomain.nhost.run
    NHOST_REGION=auto
    NHOST_ADMIN_SECRET=your-admin-secret
    NHOST_JWT_SECRET=your-jwt-secret
    
    ```
    
    - Получите значения из консоли Nhost (Settings → Environment Variables).
4. **Подключение backend:**
    - Используйте `@nhost/nhost-js` в NestJS для работы с GraphQL API:
        
        ```jsx
        import { NhostClient } from '@nhost/nhost-js';
        const nhost = new NhostClient({
          subdomain: process.env.NHOST_SUBDOMAIN,
          region: process.env.NHOST_REGION,
        });
        
        ```
        

### 3.3. Методы и сценарии

- **Регистрация пользователя:**
    - Запрос: `nhost.auth.signUp({ email, password })`.
    - Результат: Пользователь добавлен в таблицу `users`.
- **Получение чатов:**
    - GraphQL-запрос:
        
        ```graphql
        query {
          chats(where: { userId: { _eq: "1" } }) {
            id
            name
            type
          }
        }
        
        ```
        
- **Хранение сообщений:** Сообщения автоматически сохраняются в таблицу `messages`.

### 3.4. Обработка ошибок

- **401 Unauthorized:** Неверный JWT-токен → Повторная авторизация.
- **429 Too Many Requests:** Превышен лимит → Увеличьте план в Nhost.

---

### 4. Интеграция с AWS S3

### 4.1. Общая информация

- **Описание:** AWS S3 используется для хранения файлов (фото, видео, документы), отправляемых пользователями в чатах.
- **Преимущества:**
    - Высокая долговечность (11 девяток).
    - Масштабируемость до петабайт.
    - Интеграция с другими AWS-сервисами.

### 4.2. Конфигурация

1. **Создание бакета:**
    - Войдите в AWS Console → S3 → **Create Bucket**.
    - Название: `brainmessenger-files` (уникальное).
    - Регион: `us-east-1` (или ваш регион).
    - Настройки: Включите шифрование (SSE-S3) и блокировку публичного доступа.
2. **IAM-политика:**
    - Создайте роль с доступом к S3:
        
        ```json
        {
          "Effect": "Allow",
          "Action": ["s3:PutObject", "s3:GetObject"],
          "Resource": "arn:aws:s3:::brainmessenger-files/*"
        }
        
        ```
        
    - Привяжите роль к вашему серверу (см. Руководство по развертыванию).
3. **Переменные окружения:** Добавьте в `.env`:
    
    ```
    AWS_ACCESS_KEY_ID=your-access-key
    AWS_SECRET_ACCESS_KEY=your-secret-key
    AWS_S3_BUCKET=brainmessenger-files
    AWS_REGION=us-east-1
    
    ```
    

### 4.3. Методы и сценарии

- **Загрузка файла:**
    - Используйте AWS SDK в NestJS:
        
        ```jsx
        import { S3 } from 'aws-sdk';
        const s3 = new S3({
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          region: process.env.AWS_REGION,
        });
        async function uploadFile(file: Buffer, fileName: string) {
          const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: `uploads/${fileName}`,
            Body: file,
            ACL: 'private',
          };
          return s3.upload(params).promise();
        }
        
        ```
        
    - Результат: Файл сохранён в S3, URL возвращён для хранения в PostgreSQL.
- **Получение файла:**
    - Генерация временного URL:
        
        ```jsx
        const url = s3.getSignedUrl('getObject', {
          Bucket: process.env.AWS_S3_BUCKET,
          Key: `uploads/${fileName}`,
          Expires: 3600, // 1 час
        });
        
        ```
        
- **Сценарий:** Пользователь отправляет фото в чат → Файл загружается в S3, URL сохраняется в таблице `messages`.

### 4.4. Обработка ошибок

- **403 Forbidden:** Неверные ключи или политика → Проверьте IAM.
- **404 Not Found:** Файл отсутствует → Убедитесь в правильности пути.
- **429 Too Many Requests:** Превышен лимит → Оптимизируйте запросы.

---

### 5. Взаимодействие Nhost и AWS S3

- **Сценарий:**
    1. Пользователь отправляет файл через чат.
    2. Backend (NestJS) загружает файл в S3 и получает URL.
    3. URL сохраняется в PostgreSQL через Nhost GraphQL API:
        
        ```graphql
        mutation {
          insert_messages_one(object: { chatId: "1", content: "File", fileUrl: "<https://s3.amazonaws.com/>..." }) {
            id
          }
        }
        
        ```
        
- **Преимущества:**
    - Nhost управляет структурированными данными (сообщения, пользователи).
    - S3 хранит неструктурированные данные (файлы).

---

### 6. Другие интеграции

### 6.1. Firebase

- **Назначение:** Push-уведомления.
- **Конфигурация:**
    - Переменная: `FIREBASE_CREDENTIALS_PATH`.
    - Пример: Отправка уведомления через `firebase-admin`.

### 6.2. Stripe

- **Назначение:** Управление подписками.
- **Конфигурация:**
    - Переменная: `STRIPE_SECRET_KEY`.
    - Пример: Создание сессии оплаты через `stripe.checkout.sessions.create`.

### 6.3. Gmail API

- **Назначение:** Коды подтверждения для 2FA.
- **Конфигурация:** См. Техническую документацию (стр. 4-5).

---

### 7. Рекомендации

- **Безопасность:**
    - Используйте переменные окружения для ключей.
    - Настройте ротацию JWT и AWS ключей.
- **Масштабирование:**
    - Nhost: Перейдите на платный план при росте нагрузки.
    - S3: Используйте lifecycle policies для архивации старых файлов в Glacier.
- **Мониторинг:**
    - Отслеживайте затраты на S3 и лимиты Nhost через их консоли.