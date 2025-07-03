# Спецификация Ошибок BrainMessenger (Обработка Сбоев в СИСТЕМЕ)

### 1. Введение: Ошибки как Сигнал для Улучшения СИСТЕМЫ

**Название проекта:** BrainMessenger

**Описание:** Этот документ описывает **систематический подход** (Принцип 9) к обработке ошибок в BrainMessenger. Ошибки — это неизбежная часть работы любой сложной **системы**. Наша задача — не избегать их полностью, а **обрабатывать их надежно, предсказуемо и информативно** (Принцип 3: Качество), превращая сбои в возможность для **обучения и совершенствования (Кайдзен, Принцип 1, 9)**.

**Цель:** Обеспечить **единообразную и согласованную** обработку ошибок на всех уровнях (Backend API, Frontend UI, интеграции), упростить диагностику и устранение проблем для команды разработки и поддержки, и предоставить пользователям **понятные и действенные** (Принцип 2: Создание Ценности) сообщения о сбоях, не компрометируя **безопасность** (Принцип 5).

**Область применения:**
*   **Backend API (GraphQL):** Стандартизированные ответы об ошибках.
*   **Frontend (Web, Mobile, Desktop):** Отображение ошибок пользователю и логирование клиентских сбоев.
*   **Интеграции:** Обработка ошибок при взаимодействии с внешними сервисами (Neon, Cloudflare R2, Firebase, Stripe, Gmail API, AI-модели).
*   **Системные компоненты:** Логирование и мониторинг ошибок в инфраструктуре и сервисах.

**Принципы, которыми руководствуется обработка ошибок:**

*   **Система и Оптимизация (Принцип 9: Кайдзен):** Ошибки — это сигнал о "затыке" в системе. Обработка ошибок встраивается в системный процесс. Анализ ошибок — основа Кайдзен.
*   **Качество > Количество (Принцип 3):** Надежная обработка ошибок важнее скорости разработки. Все ошибки должны быть учтены и обработаны.
*   **Безопасность (Принцип 5):** Ошибки не должны раскрывать конфиденциальную информацию.
*   **Создание Ценности (Принцип 2):** Сообщение об ошибке для пользователя должно быть понятным и, если возможно, предлагать действие для решения проблемы.
*   **Ответственность (Принцип 6):** Разработчики несут ответственность за корректную обработку ошибок в своем коде.
*   **Видимость (связь с DocMonLog):** Все ошибки должны быть видны команде через мониторинг и логирование.

### 2. Общие Принципы Обработки Ошибок: Основы Надежности

*   **Единообразие:** Все ошибки, возникающие на Backend и возвращаемые через API, должны следовать стандартному формату (см. раздел 3), независимо от их первопричины (валидация, ошибка БД, сбой интеграции, бизнес-логика). Frontend должен ожидать этот формат.
*   **Безопасность:** Сообщения об ошибках, видимые пользователю, **не должны содержать чувствительных данных** (пароли, ключи API, полные пути файлов на сервере, SQL-запросы, внутренние стеки вызовов). Технические детали (стек-трейс, подробности исключения) доступны только команде разработки через логирование и Sentry.
*   **Видимость и Логирование:** **Все ошибки должны быть записаны в централизованную систему логирования** (Winston → ELK Stack) и отправлены в Sentry для агрегации, анализа и оповещения (см. DocMonLog.md). Уровень логирования для ошибок — `error`.
*   **Пользовательский Опыт:** Пользователю должно быть показано понятное сообщение на его языке (см. DocLocIn.md, долгосрочно), описывающее суть проблемы в терминах приложения, а не технических терминов. Если возможно, предложить простое действие для устранения (например, "Проверьте введенные данные", "Повторите попытку позже", "Обратитесь в поддержку").
*   **Идемпотентность:** Повторная попытка выполнения операции после получения некоторых ошибок (например, 429, 503, временные сетевые сбои) не должна приводить к нежелательным побочным эффектам (например, дублированию сообщений). Внедряйте retry-логику для временных ошибок.

### 3. Формат Ошибок API (GraphQL): Стандарт Взаимодействия

Как описано в DocSpec.md, ошибки GraphQL возвращаются в поле `errors` ответа, следуя стандарту GraphQL. Мы расширяем этот стандарт, добавляя структурированную информацию в поле `extensions`.

#### 3.1. Структура Ошибки GraphQL

```json
{
  "errors": [
    {
      "message": "User-friendly description of the error (can be localized)", // Сообщение для пользователя/разработчика
      "locations": [...], // Позиция ошибки в запросе
      "path": [...],      // Путь к полю в запросе, где возникла ошибка
      "extensions": {
        "code": "ERROR_CODE", // Стандартизированный код ошибки (см. 4.1)
        "http": { // HTTP статус код, соответствующий ошибке
          "status": 4xx/5xx
        },
        "details": { /* Дополнительные технические детали (НЕ ДЛЯ ПОЛЬЗОВАТЕЛЯ!) */ },
        "timestamp": "YYYY-MM-DDTHH:mm:ss.sssZ", // Время возникновения на сервере
        "traceId": "...", // ID трассировки запроса (если используется)
        "requestId": "...", // ID запроса (если используется)
        "service": "backend" // Имя сервиса (при микросервисах)
      }
    }
    // ... могут быть другие ошибки в списке
  ]
  // "data": null, // Обычно присутствует, но может быть null при ошибках верхнего уровня
}
```

*   **`message`:** Краткое описание ошибки. Должно быть достаточно понятным, чтобы UI мог его отобразить, или быть ключом для локализации в UI (см. DocLocIn.md).
*   **`extensions.code`:** Стандартизированный, машиночитаемый код ошибки. Используется Frontend для определения типа ошибки и выбора соответствующего UI-сообщения и действия.
*   **`extensions.http.status`:** Соответствующий HTTP статус код.
*   **`extensions.details`:** Объект, содержащий технические детали ошибки (например, результат валидации `class-validator`, детали исключения из интеграции). **Эти данные НИКОГДА не должны показываться пользователю напрямую.** Они используются для логирования и отладки командой разработки.
*   **`timestamp`, `traceId`, `requestId`, `service`:** Поля для отладки и трассировки запросов в распределенной системе (ELK, Sentry).

#### 3.2. Пример Ошибки API (Неверный Ввод)

Запрос мутации `registerUser` с неверным форматом email:

```json
{
  "errors": [
    {
      "message": "Invalid input data",
      "locations": [ { "line": 2, "column": 18 } ],
      "path": [ "registerUser" ],
      "extensions": {
        "code": "BAD_USER_INPUT",
        "http": { "status": 400 },
        "details": {
          "email": ["Email must be a valid email address"],
          "password": ["Password is too short"]
        },
        "timestamp": "2025-03-14T10:00:00.123Z"
      }
    }
  ]
}
```

### 4. Коды Ошибок и Их Обработка: Классификация Сбоев в СИСТЕМЕ

Мы используем стандартизированные коды ошибок (`extensions.code`) для единообразия. Эти коды определяют тип ошибки и как ее обрабатывать на Backend (логирование, оповещения) и Frontend (отображение пользователю, действие).

#### 4.1. Стандартные Коды Ошибок (GraphQL Spec + Custom)

| Код (`extensions.code`) | Соответствующий HTTP статус | Описание типа ошибки                 | Типичная Причина                                                                | Реакция Backend (Логирование/Оповещение) |
| :---------------------- | :-------------------------- | :----------------------------------- | :------------------------------------------------------------------------------ | :--------------------------------------- |
| `BAD_USER_INPUT`        | 400 Bad Request             | Ошибка валидации входных данных      | Пользователь отправил данные в неверном формате (email, пароль, поля формы).    | Логировать (уровень `warn` или `error`), возможно, агрегировать в Sentry.        |
| `UNAUTHENTICATED`       | 401 Unauthorized            | Требуется аутентификация             | Отсутствует JWT токен, токен неверный/истекший.                                 | Логировать (`error`), возможно, оповещение при всплеске.                         |
| `FORBIDDEN`             | 403 Forbidden               | Нет прав на выполнение операции      | Пользователь аутентифицирован, но пытается получить доступ к чужим данным или выполнить действие без прав. | Логировать (`error`), оповещение при всплеске (подозрение на атаку).           |
| `NOT_FOUND`             | 404 Not Found               | Запрошенный ресурс не найден         | Объект (пользователь, чат, сообщение) с указанным ID не существует или недоступен пользователю. | Логировать (`error`), мониторить частоту.                                    |
| `CONFLICT`              | 409 Conflict                | Конфликт данных                      | Попытка создать ресурс, который уже существует (например, email при регистрации). | Логировать (`error`).                                                        |
| `INTERNAL_SERVER_ERROR` | 500 Internal Server Error   | Непредвиденная ошибка на сервере     | Необработанное исключение в коде Backend, сбой интеграции, ошибка БД.          | **Критический уровень.** Логировать (`error`) с деталями, отправлять в Sentry, настраивать оповещение (Alertmanager). |
| `SERVICE_UNAVAILABLE`   | 503 Service Unavailable     | Сервис временно недоступен           | Внешний сервис (БД, API интеграции) временно недоступен или перегружен.       | Логировать (`error`), мониторить доступность сервисов.                         |
| `TIMEOUT`               | 408 Request Timeout         | Превышено время ожидания ответа      | Запрос к внешнему сервису или выполнение операции заняло слишком много времени.  | Логировать (`error`), мониторить задержки интеграций.                          |
| `RATE_LIMITED`          | 429 Too Many Requests       | Превышен лимит запросов (Rate Limit) | Пользователь/IP отправил слишком много запросов за короткое время.             | Логировать (`warn` или `error`), мониторить частоту срабатывания (безопасность). |
| `DB_ERROR`              | 500 Internal Server Error   | Ошибка базы данных (на уровне Prisma) | Ошибка выполнения запроса к БД (например, нарушение консистентности, deadlocks). | Логировать (`error`) с деталями Prisma, отправлять в Sentry, оповещение.       |
| `INTEGRATION_ERROR`     | 500 / 503 (зависит от причины) | Ошибка интеграции с внешним сервисом | Сбой или ошибка в работе стороннего API (Firebase, Stripe, Gmail API, R2).     | Логировать (`error`) с деталями ответа стороннего API, отправлять в Sentry.    |
| `BUSINESS_LOGIC_ERROR`  | 400 / 403 / 409 / 500 (зависит от логики) | Ошибка в бизнес-логике приложения | Неправильное состояние данных, нарушение бизнес-правил, специфичные ошибки функционала. | Логировать (`error`) с контекстом бизнес-операции, отправлять в Sentry.      |

#### 4.2. Специфические Ошибки Интеграций (Обрабатываются на Backend)

*   **Neon/PostgreSQL:** Ошибки уровня БД (нарушение уникальности, ограничения, синтаксис) обрабатываются Prisma и должны быть преобразованы в стандартные ошибки API (`DB_ERROR`, `CONFLICT`, `BAD_USER_INPUT`) на Backend.
*   **Cloudflare R2:** Ошибки при загрузке/получении файлов (доступ запрещен, файл не найден, таймаут). Обрабатываются на Backend (`INTEGRATION_ERROR`, `FORBIDDEN`, `NOT_FOUND`, `TIMEOUT`).
*   **Firebase:** Ошибки при отправке уведомлений (неверный токен устройства, превышен лимит). Обрабатываются на Backend (`INTEGRATION_ERROR`).
*   **Stripe:** Ошибки при обработке платежей (неверные данные карты, отказ банка). Обрабатываются на Backend (`INTEGRATION_ERROR`, `BUSINESS_LOGIC_ERROR`).
*   **Gmail API:** Ошибки при отправке email (неверный адрес, лимиты). Обрабатываются на Backend (`INTEGRATION_ERROR`, `BAD_USER_INPUT`, `RATE_LIMITED`).
*   **AI-ассистент (Q2 2026+):** Ошибки при взаимодействии с AI моделями (неверный промпт, превышение лимита запросов к модели, недоступность модели). Обрабатываются на Backend (`BAD_USER_INPUT`, `RATE_LIMITED`, `SERVICE_UNAVAILABLE`, `INTEGRATION_ERROR`).

#### 4.3. Ошибки Валидации Ввода

*   **Frontend Валидация:** Для удобства пользователя (мгновенный фидбек). Не заменяет Backend валидацию.
*   **Backend Валидация:** **Обязательна** для всех входящих данных (DTO с `class-validator`). Ошибки валидации должны быть преобразованы в стандартный ответ API с кодом `BAD_USER_INPUT` и деталями в `extensions.details`.

### 5. Обработка Ошибок в Коде: Построение Надежного Потока

#### 5.1. Backend (NestJS): Централизованная Обработка и Логирование

*   **NestJS Exception Filters:** Используйте глобальные фильтры исключений для перехвата всех ошибок в приложении и преобразования их в стандартный формат ответа API.
    ```typescript
    // backend/src/common/filters/all-exceptions.filter.ts (Пример глобального фильтра)
    import { Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
    import { GqlExceptionFilter, GqlArgumentsHost } from '@nestjs/graphql';
    import { ApolloError } from 'apollo-server-express'; // Или @apollo/server

    @Catch() // Перехватываем все исключения
    export class AllExceptionsFilter implements GqlExceptionFilter {
      private readonly logger = new Logger(AllExceptionsFilter.name);

      catch(exception: any, host: ArgumentsHost) {
        const gqlHost = GqlArgumentsHost.create(host);
        // Оригинальный контекст запроса (req, res) доступен через host.switchToHttp()
        const ctx = host.switchToHttp(); // Для HTTP-специфичных деталей, если нужно

        // Определение HTTP статуса и кода ошибки
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let code = 'INTERNAL_SERVER_ERROR';
        let message = 'Internal server error'; // Общее сообщение для 500
        let details = null;

        if (exception instanceof HttpException) {
          status = exception.getStatus();
          const response = exception.getResponse(); // Ответ от NestJS HttpException
          message = (response as any).message || exception.message; // Используем сообщение из NestJS ответа или стандартное
          details = (response as any).details || (response as any).error || null; // Детали могут быть в разных полях
          // Попробуйте определить более специфичный код ошибки на основе статуса и сообщения
          if (status === HttpStatus.UNAUTHORIZED) code = 'UNAUTHENTICATED';
          else if (status === HttpStatus.FORBIDDEN) code = 'FORBIDDEN';
          else if (status === HttpStatus.NOT_FOUND) code = 'NOT_FOUND';
          else if (status === HttpStatus.BAD_REQUEST) code = 'BAD_USER_INPUT'; // Часто используется для валидации
          else if (status === HttpStatus.CONFLICT) code = 'CONFLICT';
          else if (status === HttpStatus.TOO_MANY_REQUESTS) code = 'RATE_LIMITED';
          else if (status === HttpStatus.SERVICE_UNAVAILABLE) code = 'SERVICE_UNAVAILABLE';
          else if (status === HttpStatus.REQUEST_TIMEOUT) code = 'TIMEOUT';
           // TODO: Добавить обработку других специфичных HTTP статусов при необходимости

        } else if (exception.extensions?.code) {
             // Ошибка ApolloError или другая с кастомным кодом в extensions
             code = exception.extensions.code;
             status = exception.extensions.http?.status || HttpStatus.INTERNAL_SERVER_ERROR;
             message = exception.message;
             details = exception.extensions.details || exception.extensions; // Детали могут быть прямо в extensions
        } else if (exception.code === 'P' && exception.clientVersion) { // Ошибки Prisma Client (начинаются с 'P')
            status = HttpStatus.INTERNAL_SERVER_ERROR; // Ошибки Prisma Client обычно 500
            code = 'DB_ERROR';
            message = 'Database error occurred'; // Скрыть детали Prisma от пользователя
            // Логировать детально: exception.meta, exception.message
            this.logger.error(`Prisma Client Error: ${exception.code} - ${exception.message}`, { stack: exception.stack, meta: (exception as any).meta });
             // TODO: Преобразовать некоторые ошибки Prisma в более специфичные коды API (например, P2002 Unique constraint failed -> CONFLICT)
             if(exception.code === 'P2002') { // Unique constraint failed
                status = HttpStatus.CONFLICT;
                code = 'CONFLICT';
                message = 'Data conflict'; // или более специфично "Email already exists"
             }

        } else if (exception.name === 'ApolloError') {
             // Ошибки Apollo Server
             code = exception.extensions?.code || 'INTERNAL_SERVER_ERROR';
             status = exception.extensions?.http?.status || HttpStatus.INTERNAL_SERVER_ERROR;
             message = exception.message;
             details = exception.extensions;
        }
        // TODO: Добавить обработку ошибок от специфичных интеграций (R2, Kafka, Stripe), преобразуя их в стандартные коды API

        // Логирование ошибки на Backend
        if (status >= 500) {
             this.logger.error(`[${code}] ${exception.message}`, { stack: exception.stack, details: details, timestamp: new Date().toISOString() });
             // Отправка в Sentry (если не ApolloError, так как ApolloError может отправлять сам)
              if (code === 'INTERNAL_SERVER_ERROR' || status >= 500) { // Отправлять в Sentry только серверные ошибки или необработанные
                 Sentry.captureException(exception, {
                     extra: { code, status, details, originalMessage: exception.message },
                     // user: { id: req.user?.id, email: req.user?.email }, // Если пользователь аутентифицирован
                 });
              }
        } else {
             // Логировать клиентские ошибки (4xx) на уровне warn/info или не логировать вообще, если они ожидаемы
             this.logger.warn(`[${code}] Client Error: ${exception.message}`, { details: details });
        }


        // Формирование ответа для клиента (GraphQL)
        // Используем ApolloError для корректного формата в поле 'errors'
        const apolloError = new ApolloError(message, code, {
             http: { status },
             details: status >= 500 ? undefined : details, // Не отправлять детали 500 ошибок клиенту
             timestamp: new Date().toISOString(),
             traceId: gqlHost.getContext().traceId, // Пример добавления ID трассировки
             requestId: gqlHost.getContext().requestId, // Пример добавления ID запроса
             // service: 'backend', // Пример добавления имени сервиса
        });


        // Возвращаем ошибку через Apollo Server
        return apolloError;
      }
    }
    ```
*   **Выброс Специфических Ошибок:** В бизнес-логике выбрасывайте стандартные NestJS `HttpException` с соответствующим статусом или создавайте свои классы исключений, которые будут перехватываться фильтром.
    ```typescript
    // backend/src/auth/auth.service.ts
    import { HttpException, HttpStatus, UnauthorizedException, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
    // ...
    if (!user) {
      throw new NotFoundException('User not found'); // Стандартный NestJS NotFoundException (404)
    }
    if (passwordMatch) {
       // Успешный логин
    } else {
       throw new UnauthorizedException('Invalid credentials'); // Стандартный NestJS UnauthorizedException (401)
    }
    // ...
    if (chat.ownerId !== userId && !isAdmin) {
        throw new ForbiddenException('You do not have permissions to delete this message'); // 403
    }
    // ... При регистрации, если email уже занят:
    // try { await prisma.user.create(...) } catch(e) { if (e.code === 'P2002') throw new ConflictException('Email already in use'); } // 409
    ```
*   **Обработка Ошибок Интеграций:** Используйте блоки `try-catch` при вызове внешних сервисов (R2, Firebase, Stripe и т.д.). Преобразуйте специфические ошибки интеграций в стандартные ошибки API (`INTEGRATION_ERROR`, `SERVICE_UNAVAILABLE` и т.д.).
    ```typescript
    // backend/src/storage/storage.service.ts
    import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
    import { ForbiddenException, HttpStatus, Logger } from '@nestjs/common';
    import { ApolloError } from 'apollo-server-express'; // Или @apollo/server

    @Injectable()
    export class StorageService {
       private readonly logger = new Logger(StorageService.name);
       // ... S3Client инициализация ...

       async uploadFile(fileBuffer: Buffer, fileName: string): Promise<string> {
          try {
              const params = { /* ... */ };
              await this.r2.send(new PutObjectCommand(params));
              return "file-url";
          } catch (error) {
              this.logger.error(`Failed to upload file to R2: ${error.message}`, { stack: error.stack, r2Error: error });
              // Преобразуем ошибку AWS SDK в стандартную ошибку API
              if (error.Code === 'AccessDenied') { // Пример кода ошибки AWS S3/R2
                   throw new ForbiddenException('Access denied to storage'); // 403
              }
              // Выбросить стандартную INTERNAL_SERVER_ERROR, если ошибка неизвестна
              throw new ApolloError('Failed to upload file', 'INTEGRATION_ERROR', { http: { status: HttpStatus.INTERNAL_SERVER_ERROR }, details: { service: 'Cloudflare R2', message: error.message } });
          }
       }
    }
    ```
*   **Логирование:** Используйте Winston-логгер в Backend для записи всех важных событий и ошибок с контекстом. Настройте отправку логов в ELK и ошибок уровня `error` в Sentry.

#### 5.2. Frontend (Клиентские Приложения): Обработка и Отображение Ошибок UI

*   **Обработка Ошибок API (GraphQL Client):** Используйте возможности Apollo Client (поле `error` в хуках `useQuery`, `useMutation`) для перехвата ошибок, возвращенных Backend API.
    ```jsx
    // packages/web/components/LoginForm.tsx (Пример обработки ошибки логина)
    import { useMutation, gql } from '@apollo/client';
    import { useState } from 'react';
    // ... UI импорты (Button, Input, ErrorMessage Component)

    const LOGIN_MUTATION = gql`
      mutation Login($email: String!, $password: String!) {
        loginUser(input: { email: $email, password: $password }) {
          token
          user { id name }
        }
      }
    `;

    const LoginForm = () => {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [loginError, setLoginError] = useState(null); // Состояние для ошибки

      const [loginMutation, { loading }] = useMutation(LOGIN_MUTATION, {
        onCompleted: (data) => {
          // Успешный логин, сохранить токен, редирект
          console.log('Logged in', data);
        },
        onError: (error) => {
          // Обработка ошибок API
          console.error('Login error', error);
          setLoginError(error); // Сохранить объект ошибки для отображения
          // Логировать ошибку в Sentry на клиенте
          Sentry.captureException(error, {
             extra: { context: 'login_form' },
             user: { email: email } // Добавить email пользователя (если нет чувствительных данных)
          });
        },
      });

      const handleSubmit = async () => {
        setLoginError(null); // Сброс предыдущих ошибок
        try {
          await loginMutation({ variables: { email, password } });
        } catch (e) {
          // Ошибки уже обработаны в onError, здесь можно ничего не делать или логировать
          console.log("Caught error in handleSubmit, already processed by onError");
        }
      };

      const getApiErrorDetails = (error) => {
         // Извлекаем код и сообщение из стандартного формата Apollo/GraphQL
         const graphQLErrors = error?.graphQLErrors?.[0];
         const networkError = error?.networkError as any; // Ошибки сети

         if (graphQLErrors) {
             return {
                 code: graphQLErrors.extensions?.code || 'GRAPHQL_ERROR', // Используем наш кастомный код
                 message: graphQLErrors.message || 'GraphQL error',
                 httpStatus: graphQLErrors.extensions?.http?.status,
                 // details: graphQLErrors.extensions?.details, // Не отображаем детали пользователю
             };
         }
         if (networkError) {
              // Обработка сетевых ошибок (например, 500, 503, 408)
              return {
                  code: networkError.statusCode || 'NETWORK_ERROR',
                  message: networkError.message || 'Network error',
                  httpStatus: networkError.statusCode,
              };
         }
         // Другие типы ошибок
         return {
              code: error?.message || 'UNKNOWN_ERROR',
              message: error?.message || 'An unknown error occurred',
              httpStatus: null,
         };
      };

      const errorInfo = loginError ? getApiErrorDetails(loginError) : null;


      return (
        <View>
          {/* ... Поля ввода email и password ... */}
          <Button title="Log In" onPress={handleSubmit} disabled={loading} />
          {errorInfo && (
             // Отображаем компонент ошибки, который выберет сообщение и действие по коду
             <ErrorMessage code={errorInfo.code} message={errorInfo.message} httpStatus={errorInfo.httpStatus} />
          )}
          {/* ... Ссылка Забыли пароль ... */}
        </View>
      );
    };
    ```
*   **Логирование Клиентских Ошибок:** Используйте Sentry SDK на Frontend для автоматического захвата ошибок JavaScript (ошибки рендеринга React, ошибки в логике). Это дает видимость проблем на стороне пользователя.
*   **Обработка UI Ошибок:** Используйте блоки `try-catch` в коде Frontend для перехвата потенциальных ошибок (например, при работе с локальным хранилищем, при вызове нативных модулей) и их логирования в Sentry.

### 6. Отображение Ошибок в UI: Понятный Язык для Пользователя (Принцип 2, 3)

Сообщения об ошибках должны быть **понятными, нетехническими и, если возможно, предлагать действие**. UI должен выбирать сообщение и тип отображения на основе кода ошибки (`extensions.code`) или HTTP статуса. (См. DocUI.md).

*   **Принципы Отображения:**
    *   Показывать только `message` из ответа API (или локализованную версию).
    *   **Никогда не показывать `details` пользователю.**
    *   Использовать разные типы UI-элементов для разных типов ошибок:
        *   **Inline/Под полем ввода:** Для ошибок валидации (`BAD_USER_INPUT`).
        *   **Тост/Snackbar:** Для неблокирующих временных ошибок (429, 503, успешная отправка кода подтверждения с ошибкой на API интеграции).
        *   **Модальное окно/Алерт:** Для блокирующих или критических ошибок (401, 403, 404, 500).
    *   Предлагать **действие** (кнопка "Повторить", "Выйти", "Обратиться в поддержку").
*   **Примеры UI-сообщений и Действий (Связь Кода → UI → Действие):**

| Код (`extensions.code`) | HTTP Статус | UI-сообщение (для пользователя)                                     | Тип UI-элемента     | Предлагаемое действие пользователя                      | Связь с Принципами             |
| :---------------------- | :---------- | :------------------------------------------------------------------ | :------------------ | :------------------------------------------------------ | :----------------------------- |
| `BAD_USER_INPUT`        | 400         | "Неверный формат данных в поле [Имя Поля]" / "Проверьте введенные данные" | Inline под полем    | Исправить данные в поле и повторить                     | P2 (Ценность - помощь), P3 (Качество) |
| `UNAUTHENTICATED`       | 401         | "Ваша сессия истекла. Войдите заново."                              | Модальное окно      | Кнопка "Выйти" (для перенаправления на экран входа)     | P5 (Безопасность), P2 (Ценность) |
| `FORBIDDEN`             | 403         | "У вас нет прав для выполнения этого действия."                     | Модальное окно/Тост | "OK", возможно "Обратиться в поддержку"                 | P5 (Безопасность), P2 (Ценность) |
| `NOT_FOUND`             | 404         | "Элемент не найден." / "Чат или пользователь не существует."          | Модальное окно/Тост | "OK", "Проверьте ID"                                    | P2 (Ценность)                  |
| `CONFLICT`              | 409         | "Этот email уже зарегистрирован." / "Объект уже существует."         | Inline под полем/Модальное окно | Изменить введенные данные (email) / "OK"               | P2 (Ценность)                  |
| `RATE_LIMITED`          | 429         | "Слишком много запросов. Попробуйте позже." / "Подождите N секунд." | Тост/Inline текст   | Подождать и повторить (возможно, с таймером обратного отсчета) | P5 (Безопасность), P2 (Ценность) |
| `INTERNAL_SERVER_ERROR` | 500         | "Произошла ошибка на сервере. Попробуйте повторить позже."          | Модальное окно/Тост | Кнопка "Повторить", "Закрыть"                         | P2 (Ценность), P3 (Надежность) |
| `SERVICE_UNAVAILABLE`   | 503         | "Сервис временно недоступен. Попробуйте позже."                   | Модальное окно/Тост | Кнопка "Повторить", "Закрыть"                         | P2 (Ценность), P3 (Надежность) |
| `TIMEOUT`               | 408         | "Превышено время ожидания ответа. Проверьте ваше соединение."     | Модальное окно/Тост | Кнопка "Повторить", "Проверить сеть"                  | P2 (Ценность), P3 (Надежность) |
| `DB_ERROR`              | 500         | "Произошла ошибка базы данных. Попробуйте позже."                 | Модальное окно/Тост | Кнопка "Повторить" (обрабатывается как INTERNAL_SERVER_ERROR) | P2, P3                           |
| `INTEGRATION_ERROR`     | 500 / 503   | "Ошибка при интеграции с внешним сервисом. Попробуйте позже."       | Модальное окно/Тост | Кнопка "Повторить" (обрабатывается как INTERNAL_SERVER_ERROR/SERVICE_UNAVAILABLE) | P2, P3                           |
| `BUSINESS_LOGIC_ERROR`  | 4xx / 5xx   | "Не удалось выполнить операцию: [Описание ошибки бизнес-логики]"      | Модальное окно      | Зависит от ошибки (например, "Проверьте настройки чата") | P2, P3                           |
| `NETWORK_ERROR`         | (Нет)       | "Отсутствует интернет-соединение. Проверьте сеть."                  | Тост/Баннер вверху  | Проверить соединение, "Повторить"                     | P2, P3                           |
| `SOUND_ERROR`           | (Нет)       | "Не удалось воспроизвести звук."                                  | Тост (опционально)  | "ОК"                                                    | P2, P3                           |

*   **UI Component for Errors:** Создайте переиспользуемый компонент на Frontend, который принимает код ошибки и сообщение, и выбирает соответствующее отображение и действия.

### 7. Устранение Проблем и Предотвращение: Кайдзен в Действии

Обработка ошибок — это не только реагирование, но и **проактивное предотвращение** (Принцип 6).

#### 7.1. Разработчикам (Backend/Frontend): Пишем Код, Устойчивый к Сбоям

*   **Валидация:** Всегда валидируйте входные данные на Backend (class-validator). Преобразуйте ошибки валидации в `BAD_USER_INPUT`.
*   **Null/Undefined:** Аккуратно обрабатывайте потенциальные `null` или `undefined` значения (опциональные поля в GraphQL, ответы интеграций). Используйте опциональные цепочки (`?.`), оператор нулевого слияния (`??`). TypeScript помогает с этим.
*   **Обработка Интеграций:** Используйте блоки `try-catch` при вызовах внешних API. Логируйте детально ошибки интеграций, но скрывайте их детали от пользователя (преобразуя в `INTEGRATION_ERROR` или `SERVICE_UNAVAILABLE`).
*   **Retry Логика:** Внедрите автоматические повторные попытки (retry) для временных ошибок (`RATE_LIMITED`, `SERVICE_UNAVAILABLE`, `TIMEOUT`, `NETWORK_ERROR`) на Frontend или Backend при вызове других сервисов/интеграций. Используйте экспоненциальную задержку между попытками.
*   **Транзакции:** Для операций, требующих нескольких шагов в БД, используйте транзакции Prisma, чтобы обеспечить атомарность (все или ничего).
*   **Идемпотентность:** Проектируйте API и воркеры Kafka так, чтобы повторный вызов не приводил к нежелательным последствиям.
*   **Код-ревью:** Уделяйте особое внимание обработке ошибок и потенциальным точкам сбоя во время код-ревью.

#### 7.2. Тестировщикам: Поиск "Затыков"

*   Проверяйте все сценарии ошибок, включая негативные кейсы (неверные данные, отсутствие прав, отключение внешних сервисов).
*   Используйте инструменты для симуляции плохой сети (ограничение пропускной способности, задержка, потеря пакетов) для тестирования обработки сетевых ошибок (408, 503).
*   Проверяйте, что пользовательские сообщения об ошибках понятны и соответствуют спецификации.

#### 7.3. DevOps: Мониторинг и Инфраструктура

*   Настройте **оповещения** в Grafana/Prometheus/Sentry для своевременного уведомления об ошибках и сбоях.
*   Регулярно проверяйте логи в ELK/Kibana на наличие необработанных ошибок или необычных паттернов.
*   Убедитесь, что инфраструктура устойчива к сбоям (достаточно реплик, Health Checks).
*   Мониторьте доступность внешних сервисов.

#### 7.4. Команде Поддержки: Первый Эшелон

*   Используйте коды ошибок и сообщения пользователя для быстрой диагностики.
*   Сообщайте о "свежих" или необработанных ошибках команде разработки/DevOps, предоставляя максимум контекста (пользователь, время, шаги, скриншоты, версия приложения).

### 8. Примечания: Непрерывное Совершенствование

*   **Документирование:** Этот документ является живым. Список кодов ошибок и их обработка могут расширяться по мере добавления нового функционала (например, AI в Q2 2026).
*   **Локализация:** В будущем сообщения об ошибках в UI должны быть локализованы (см. DocLocIn.md), используя код ошибки как ключ локализации.
*   **Аудит:** Регулярно проводите аудит обработки ошибок и безопасности системы.

Эффективная обработка ошибок — это признак **зрелой и надежной СИСТЕМЫ**. Это ключ к поддержанию **качества** BrainMessenger и доверия пользователей.

---
