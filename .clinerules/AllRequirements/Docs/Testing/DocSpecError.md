# Спецификация ошибок BrainMessenger

### 1. Введение

**Название проекта:** BrainMessenger

**Описание:** Документ описывает подход к обработке ошибок в мессенджере BrainMessenger, включая коды ошибок, их формат, отображение в UI и действия для устранения.

**Цель:** Обеспечить согласованность обработки ошибок, упростить отладку и улучшить пользовательский опыт при возникновении сбоев.

**Область применения:** API (GraphQL), UI (React Native), интеграции (Nhost, AWS S3, Firebase и др.).

---

### 2. Общие принципы

- **Единообразие:** Все ошибки имеют стандартный формат ответа для API и предсказуемое отображение в UI.
- **Безопасность:** Сообщения об ошибках не раскрывают чувствительные данные (например, ключи, пароли).
- **Логирование:** Все ошибки записываются в логи (Winston) и отправляются в Sentry для анализа (см. Руководство по мониторингу).
- **Доступность:** Пользователю показываются понятные сообщения с действиями для решения проблемы, если это возможно.

---

### 3. Формат ошибок API

Ошибки возвращаются в JSON-формате через GraphQL или REST (если используется).

### 3.1. Структура

```json
{
  "error": {
    "code": <HTTP-код>,
    "message": "<Краткое описание>",
    "details": "<Дополнительная информация (опционально)>",
    "timestamp": "<ISO 8601 дата>"
  }
}

```

- **code:** HTTP-статус (например, 400, 401).
- **message:** Человекочитаемое описание для разработчиков и UI.
- **details:** Технические детали (только для разработчиков, не показываются пользователю).
- **timestamp:** Время возникновения ошибки (например, `2025-03-14T10:00:00Z`).

### 3.2. Пример

```json
{
  "error": {
    "code": 401,
    "message": "Unauthorized",
    "details": "Invalid JWT token",
    "timestamp": "2025-03-14T10:00:00Z"
  }
}

```

---

### 4. Коды ошибок и их обработка

### 4.1. Общие ошибки

| Код | Описание | Причина | UI-сообщение | Действие пользователя |
| --- | --- | --- | --- | --- |
| 400 | Bad Request | Некорректный ввод | "Проверьте введённые данные" | Исправить данные и повторить |
| 401 | Unauthorized | Неверные credentials или токен | "Войдите заново" | Выйти и войти снова |
| 403 | Forbidden | Нет доступа | "Доступ запрещён" | Обратиться в поддержку |
| 404 | Not Found | Ресурс не найден | "Элемент не найден" | Проверить запрос |
| 429 | Too Many Requests | Превышен лимит запросов | "Подождите 5 секунд" | Подождать и повторить |
| 500 | Internal Server Error | Сбой сервера | "Что-то пошло не так, попробуйте позже" | Повторить позже |
| 503 | Service Unavailable | Сервер недоступен | "Сервис временно недоступен" | Подождать и повторить |

### 4.2. Специфические ошибки интеграций

| Код | Описание | Сервис | UI-сообщение | Действие пользователя |
| --- | --- | --- | --- | --- |
| 400 | Invalid API Key | Nhost/AWS | "Проверьте настройки ключа" | Обновить ключ в настройках |
| 429 | Rate Limit Exceeded | Nhost | "Превышен лимит, подождите" | Подождать или сменить план |
| 403 | Access Denied | AWS S3 | "Нет доступа к файлу" | Проверить права доступа |
| 502 | Bad Gateway | Firebase | "Ошибка уведомлений, попробуйте позже" | Повторить позже |
| 408 | Request Timeout | Gmail API | "Проверьте интернет" | Проверить сеть и повторить |

### 4.3. Ошибки AI-ассистента (Q2 2026)

| Код | Описание | Причина | UI-сообщение | Действие пользователя |
| --- | --- | --- | --- | --- |
| 400 | Invalid Prompt | Некорректный промпт | "Уточните запрос для AI" | Переписать промпт |
| 429 | AI Limit Reached | 50 запросов/день исчерпаны | "Лимит AI достигнут. Используйте свой ключ" | Вставить API-ключ или ждать |
| 503 | AI Service Unavailable | Сбой Claude/Gemini/ChatGPT | "AI временно недоступен" | Повторить позже |

---

### 5. Обработка ошибок в коде

### 5.1. Backend (NestJS)

- **Глобальный обработчик:**
    
    ```tsx
    import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common'
    import { HttpException } from '@nestjs/common'
    
    @Catch(HttpException)
    export class HttpExceptionFilter implements ExceptionFilter {
      catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse()
        const status = exception.getStatus()
        const message = exception.message
    
        response.status(status).json({
          error: {
            code: status,
            message,
            details: exception.getResponse(),
            timestamp: new Date().toISOString(),
          },
        })
      }
    }
    
    ```
    
- **Пример выброса ошибки:**
    
    ```tsx
    if (!user) {
      throw new HttpException('User not found', 404)
    }
    
    ```
    

### 5.2. Frontend (React Native)

- **Обработка GraphQL-ответов:**
    
    ```jsx
    import { useQuery } from '@apollo/client'
    
    const { loading, error, data } = useQuery(GET_USER)
    if (error) {
      const { code, message } = error.graphQLErrors[0]?.extensions?.error || {}
      Alert.alert(
        'Ошибка',
        message || 'Что-то пошло не так',
        [{ text: 'OK', onPress: () => handleRetry(code) }]
      )
    }
    
    ```
    
- **UI-компонент для ошибок:**
    
    ```jsx
    const ErrorMessage = ({ code, message }) => (
      <View>
        <Text>{message}</Text>
        {code === 429 && <Text>Попробуйте через 5 секунд</Text>}
      </View>
    )
    
    ```
    

### 5.3. Логирование

- **Winston:**
    
    ```jsx
    import { logger } from './logger'
    logger.error('Database timeout', { endpoint: '/graphql', code: 500 })
    
    ```
    
- **Sentry:**
    
    ```jsx
    import * as Sentry from '@sentry/node'
    Sentry.captureException(new Error('Database timeout'), { extra: { endpoint: '/graphql' } })
    
    ```
    

---

### 6. Отображение ошибок в UI

- **Принципы:**
    - Показывать только `message` из ответа API.
    - `details` скрыты от пользователя, доступны в логах/Sentry.
    - Предлагать действие (кнопка "Повторить", "Выйти" и т.д.).
- **Примеры:**
    - **401:** Модальное окно "Войдите заново" с кнопкой "Log Out".
    - **429:** Текст "Подождите 5 секунд" с таймером обратного отсчёта.
    - **500:** Тост "Попробуйте позже" с кнопкой "Retry".

---

### 7. Рекомендации по устранению

### 7.1. Разработчикам

- Проверяйте входные данные перед запросами (например, email через regex).
- Добавляйте retry-логику для временных ошибок (429, 503):
    
    ```jsx
    const retryRequest = async (fn, retries = 3, delay = 5000) => {
      for (let i = 0; i < retries; i++) {
        try {
          return await fn()
        } catch (err) {
          if (i === retries - 1) throw err
          await new Promise((res) => setTimeout(res, delay))
        }
      }
    }
    
    ```
    
- Используйте `try-catch` для всех интеграций (Nhost, AWS S3).

### 7.2. Тестировщикам

- Проверяйте каждый код ошибки (см. Руководство по тестированию).
- Тестируйте сценарии с плохой сетью (408, 503).

### 7.3. DevOps

- Настройте оповещения для 500/503 ошибок (>5% за 5 минут) в Grafana (см. Руководство по мониторингу).

---

### 8. Примечания

- **Расширение:** Список ошибок может дополняться с новыми функциями (например, AI в Q2 2026).
- **Локализация:** Сообщения в UI должны поддерживать перевод (см. будущий Localization Guide).
- **Аудит:** Проверяйте обработку ошибок перед каждым релизом.