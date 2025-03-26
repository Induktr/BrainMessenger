# Руководство по разработке BrainMessenger

### 1. Введение

**Название проекта:** BrainMessenger

**Описание:** Руководство описывает структуру проекта, стандарты кодирования, используемые инструменты и процессы разработки для BrainMessenger — мессенджера с поддержкой чатов, звонков и AI-интеграций.

**Цель:** Обеспечить единый подход к разработке, упростить подключение новых разработчиков и поддерживать масштабируемость проекта.

**Аудитория:** Frontend-, backend- и DevOps-разработчики.

---

### 2. Структура репозитория

Проект организован как монолитный репозиторий с разделением на подмодули для удобства управления.

```
BrainMessenger/
├── backend/                # Серверная часть (NestJS)
│   ├── src/                # Исходный код
│   ├── test/               # Тесты
│   └── package.json        # Зависимости backend
├── frontend/               # Клиентская часть (React Native)
│   ├── src/                # Исходный код
│   ├── assets/             # Статические файлы (иконки, изображения)
│   └── package.json        # Зависимости frontend
├── infrastructure/         # Инфраструктура (Terraform, Kubernetes)
│   ├── k8s/                # Манифесты Kubernetes
│   └── main.tf             # Terraform-конфигурация
├── docs/                   # Документация проекта
└── .env.example            # Пример переменных окружения

```

- **backend:** Логика API, интеграции (Nhost, AWS S3, Firebase).
- **frontend:** UI/UX для мобильных устройств и веб.
- **infrastructure:** Настройка серверов и кластера.

---

### 3. Технологический стек

| Компонент | Технология | Версия | Назначение |
| --- | --- | --- | --- |
| Frontend | React Native | 0.72+ | UI для iOS/Android |
| Backend | NestJS | 10.x | GraphQL API, бизнес-логика |
| База данных | PostgreSQL (Nhost) | 15.x | Хранение данных пользователей |
| Хранилище | AWS S3 | - | Файлы (медиа, документы) |
| Кэширование | Redis | 7.x | Лимиты, временные данные |
| Оркестрация | Kubernetes | 1.24+ | Масштабирование серверов |
| Инфраструктура | Terraform | 1.5+ | Автоматизация деплоя |
| Тестирование | Jest, Cypress | - | Модульные и интеграционные тесты |

---

### 4. Стандарты кодирования

### 4.1. Общие принципы

- Следуйте принципам **DRY** (Don’t Repeat Yourself) и **KISS** (Keep It Simple, Stupid).
- Используйте английский язык для названий переменных, функций и комментариев.
- Комментарии обязательны для сложной логики (например, шифрование, интеграции).

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

- **Frontend (React Native):**
    - Компоненты: `/src/components/Button.tsx`.
    - Экраны: `/src/screens/ChatScreen.tsx`.
    - Хуки: `/src/hooks/useAuth.ts`.
- **Backend (NestJS):**
    - Модули: `/src/auth/auth.module.ts`.
    - Сервисы: `/src/user/user.service.ts`.
    - Контроллеры: `/src/chat/chat.resolver.ts`.

---

### 5. Используемые библиотеки

### 5.1. Frontend

- `@react-navigation/native` — Навигация между экранами.
- `react-native-animated` — Анимации UI (см. Документацию дизайна).
- `@apollo/client` — GraphQL-запросы к Nhost.

### 5.2. Backend

- `@nestjs/graphql` — GraphQL API.
- `@nestjs/jwt` — Аутентификация через JWT.
- `aws-sdk` — Работа с AWS S3.
- `@nhost/nhost-js` — Интеграция с Nhost.

### 5.3. Общие

- `winston` — Логирование (см. Руководство по мониторингу).
- `@sentry/node` — Отслеживание ошибок.

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
    cd backend && npm install
    cd ../frontend && npm install
    
    ```
    
3. Скопируйте `.env.example` в `.env` и заполните переменные (см. Руководство по развертыванию).

### 6.2. Локальный запуск

- **Backend:**
    
    ```bash
    cd backend
    npm run start:dev
    
    ```
    
- **Frontend:**
    
    ```bash
    cd frontend
    npm run ios  # или npm run android
    
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
    cd backend && npm test
    cd frontend && npm test
    
    ```
    
- Используйте Jest для модульных тестов, Cypress для интеграционных (см. Руководство по тестированию).

---

### 7. Рекомендации по разработке

### 7.1. Frontend

- **Компоненты:** Делайте их переиспользуемыми и с минимальной логикой.
    - Пример: `<Button title="Send" onPress={handleSend} />`.
- **Анимации:** Следуйте Документации дизайна (раздел 5).
- **GraphQL:** Используйте Apollo Client с кэшированием запросов.

### 7.2. Backend

- **GraphQL:** Оптимизируйте резолверы, избегайте N+1 запросов (DataLoader).
- **Интеграции:**
    - Nhost: Используйте `@nhost/nhost-js` для авторизации и запросов.
    - AWS S3: Загружайте файлы асинхронно с `aws-sdk`.
- **Ошибки:** Логируйте через Winston, отправляйте в Sentry (см. Руководство по мониторингу).

### 7.3. Безопасность

- Не коммитьте ключи в Git — используйте `.env`.
- Шифруйте чувствительные данные перед сохранением (см. Руководство по безопасности).

---

### 8. Процесс деплоя

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
        
    3. Проверка:
        
        ```bash
        curl <https://api.brainmessenger.com/health>
        
        ```
        

---

### 9. Полезные команды

| Команда | Описание | Расположение |
| --- | --- | --- |
| `npm run lint` | Проверка линтинга | backend, frontend |
| `npm run build` | Сборка продакшен-версии | backend, frontend |
| `npm run migrate` | Применение миграций БД | backend |
| `terraform apply` | Развёртывание инфраструктуры | infrastructure |

---

### 10. Примечания

- **Онбординг:** Новые разработчики должны изучить Техническую документацию и Документацию дизайна перед стартом.
- **Обновления:** Стандарты могут корректироваться с ростом проекта (например, при переходе на микросервисы в Q1 2026).
- **Вопросы:** Обращайтесь в Slack (#dev-team) или к техлиду.