# Руководство по мониторингу и логированию BrainMessenger

### 1. Введение

**Название проекта:** BrainMessenger

**Описание:** Руководство описывает процессы мониторинга производительности, ошибок и активности системы, а также сбора и анализа логов для BrainMessenger.

**Цель:** Обеспечить стабильность приложения, быстро выявлять и устранять проблемы, поддерживать uptime 99.9% и соответствовать требованиям безопасности.

---

### 2. Цели мониторинга и логирования

- **Мониторинг:**
  - Отслеживание производительности (время ответа, нагрузка).
  - Обнаружение ошибок и сбоев.
  - Контроль состояния внешних сервисов (Neon, Cloudflare R2).
- **Логирование:**
  - Фиксация ключевых событий (входы, ошибки, транзакции).
  - Анализ причин инцидентов.
  - Обеспечение трассировки без раскрытия персональных данных.

---

### 3. Инструменты

| Инструмент   | Назначение            | Установка/Конфигурация               |
|--------------|-----------------------|--------------------------------------|
| Prometheus   | Сбор метрик           | Docker: `prom/prometheus:latest`     |
| Grafana      | Визуализация метрик   | Docker: `grafana/grafana:latest`     |
| Sentry       | Отслеживание ошибок   | SDK: `@sentry/node` в NestJS         |
| ELK Stack    | Логирование и анализ  | Docker: `elastic/elasticsearch`, `kibana` |
| Datadog      | Мониторинг и логи (опционально) | Агент: `datadog-agent` на сервере |

---

### 4. Метрики для мониторинга

#### 4.1. Основные метрики

| Метрика           | Описание                        | Целевое значение |
|-------------------|---------------------------------|------------------|
| Время ответа API  | Среднее время обработки запросов | <500 мс          |
| Уровень ошибок    | % запросов с кодами 4xx/5xx     | <1%              |
| CPU Usage         | Загрузка процессора сервера     | <80%             |
| Memory Usage      | Использование памяти            | <75%             |
| Database Latency  | Время ответа PostgreSQL (Neon)  | <100 мс          |
| R2 Latency        | Время доступа к файлам (Cloudflare R2) | <200 мс   |
| Uptime            | Доступность системы             | ≥99.9%           |

#### 4.2. Дополнительные метрики

- Количество активных пользователей (за час).
- Частота запросов к API (req/s).
- Скорость доставки уведомлений (Firebase).

---

### 5. Настройка мониторинга

#### 5.1. Prometheus

1. **Установка:**
   ```bash
   docker run -d -p 9090:9090 --name prometheus prom/prometheus:latest
   ```
2. **Конфигурация (`prometheus.yml`):**
   ```yaml
   scrape_configs:
     - job_name: 'brainmessenger'
       static_configs:
         - targets: ['backend:3000'] # NestJS сервер
     - job_name: 'neon'
       static_configs:
         - targets: ['neon-host:port'] # Укажите хост Neon
   ```
3. **Экспорт метрик из NestJS:**
   - Добавьте `@nestjs/prometheus`:
     ```typescript
     import { PrometheusModule } from '@nestjs/prometheus';
     @Module({
       imports: [PrometheusModule.register()],
     })
     export class AppModule {}
     ```

#### 5.2. Grafana

1. **Установка:**
   ```bash
   docker run -d -p 3000:3000 --name grafana grafana/grafana:latest
   ```
2. **Подключение Prometheus:**
   - В Grafana UI: Data Sources → Add Prometheus → URL: `http://prometheus:9090`.
3. **Дашборды:**
   - Импортируйте шаблон для Node.js или создайте кастомный с метриками (CPU, latency, errors).

#### 5.3. Sentry

1. **Установка в NestJS:**
   ```bash
   npm install @sentry/node
   ```
2. **Инициализация:**
   ```typescript
   import * as Sentry from '@sentry/node';
   Sentry.init({
     dsn: 'your-sentry-dsn',
     environment: process.env.NODE_ENV,
   });
   ```
3. **Пример логирования ошибки:**
   ```typescript
   try {
     throw new Error('Database connection failed');
   } catch (error) {
     Sentry.captureException(error);
   }
   ```

---

### 6. Настройка логирования

#### 6.1. Формат логов

- **Тип:** JSON для удобства парсинга.
- **Поля:**
  ```json
  {
    "timestamp": "2025-03-13T10:00:00Z",
    "level": "info/error/warn",
    "message": "User logged in",
    "context": {
      "userId": "1",
      "endpoint": "/api/graphql"
    }
  }
  ```
- **Ограничения:** Не включать персональные данные (пароли, email) в явном виде.

#### 6.2. ELK Stack

1. **Установка:**
   ```bash
   docker run -d -p 9200:9200 --name elasticsearch elastic/elasticsearch:8.10.0
   docker run -d -p 5601:5601 --name kibana --link elasticsearch kibana:8.10.0
   ```
2. **Интеграция с NestJS:**
   - Используйте `winston` и `winston-elasticsearch`:
     ```typescript
     import { createLogger, transports } from 'winston';
     import { ElasticsearchTransport } from 'winston-elasticsearch';
     const logger = createLogger({
       transports: [
         new ElasticsearchTransport({
           clientOpts: { node: 'http://elasticsearch:9200' },
         }),
       ],
     });
     logger.info('User logged in', { userId: '1' });
     ```
3. **Просмотр логов:** Откройте Kibana (`http://localhost:5601`) → Создайте индекс `logstash-*`.

#### 6.3. Datadog (опционально)

1. **Установка агента:**
   ```bash
   DD_API_KEY=your-api-key bash -c "$(curl -L https://install.datadoghq.com/scripts/install.sh)"
   ```
2. **Конфигурация:** Включите интеграции для Node.js, PostgreSQL, Cloudflare R2.

---

### 7. Оповещения

- **Инструмент:** Grafana или Datadog.
- **Примеры триггеров:**
  - Время ответа API >1 сек → Email/Slack.
  - Ошибки 5xx >5% за 5 минут → SMS/Slack.
  - CPU Usage >90% → Slack.
- **Настройка в Grafana:**
  - Alerts → Add Rule → Укажите метрику и порог → Настройте канал (Slack webhook).

---

### 8. Рекомендации по анализу

- **Производительность:** Сравнивайте latency с целевыми значениями (<500 мс).
- **Ошибки:** Фильтруйте в Sentry по частоте и типу (например, 500 Internal Server Error).
- **Логи:** Ищите паттерны в Kibana (например, рост запросов перед сбоем).
- **Cloudflare R2/Neon:** Мониторьте доступность через `curl` или метрики Prometheus.

---

### 9. Примеры использования

- **Лог входа:**
  ```json
  {"timestamp": "2025-03-13T10:00:00Z", "level": "info", "message": "User logged in", "context": {"userId": "1"}}
  ```
- **Ошибка API:**
  ```json
  {"timestamp": "2025-03-13T10:01:00Z", "level": "error", "message": "Database timeout", "context": {"endpoint": "/graphql"}}
  ```
- **Дашборд Grafana:** График "API Response Time" с порогом 500 мс.

---

### 10. Примечания

- **Хранение:** Логи хранятся 30 дней, метрики — 90 дней.
- **Безопасность:** Исключите из логов чувствительные данные (см. Руководство по безопасности).
- **Масштабирование:** Увеличьте ресурсы ELK при росте объёма логов (>1 ГБ/день).