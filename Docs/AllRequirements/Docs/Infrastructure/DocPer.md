# Документация производительности BrainMessenger

### 1. Введение

**Название проекта:** BrainMessenger

**Описание:** Документ определяет стандарты производительности BrainMessenger, включая целевые показатели, подходы к оптимизации и мониторинг, чтобы обеспечить быструю работу приложения при высокой нагрузке.

**Цель:** Достичь latency <500 мс, поиска <300 мс и uptime 99.9% (NFR-1, NFR-2, NFR-12), поддерживая до 1 млн активных пользователей (NFR-4).

**Текущий статус:** Оптимизация для MVP (v1.0, март 2025), дальнейшее улучшение запланировано на Q1-Q2 2025.

---

### 2. Целевые показатели производительности

| Метрика | Цель | Контекст | Источник |
| --- | --- | --- | --- |
| Время ответа API | <500 мс | Любой GraphQL-запрос | NFR-1 |
| Время поиска чатов | <300 мс | Поиск по имени/сообщению | NFR-2 |
| Доставка сообщений | <1 сек | От отправки до отображения | NFR-3 |
| Время загрузки UI | <500 мс | Открытие экрана (мобильный/веб) | NFR-5 |
| Uptime | ≥99.9% | Доступность сервера за 24 часа | NFR-12 |
| Нагрузка | 1000 одновременных пользователей | Без деградации производительности | TC-17 |

---

### 3. Архитектурные принципы оптимизации

- **Кэширование:** Используйте Redis для частых запросов (например, список чатов).
- **Асинхронность:** Обрабатывайте операции (отправка сообщений, загрузка файлов) асинхронно.
- **Масштабирование:** Kubernetes для горизонтального масштабирования серверов.
- **Лёгкий UI:** Минимизируйте рендеринг React Native компонентов.

---

### 4. Рекомендации по оптимизации

### 4.1. Frontend (React Native)

- **Кэширование данных:**
    - Используйте `@apollo/client` с InMemoryCache для GraphQL:
        
        ```jsx
        const client = new ApolloClient({
          uri: '<https://api.brainmessenger.com/graphql>',
          cache: new InMemoryCache(),
        })
        
        ```
        
- **Оптимизация рендеринга:**
    - Применяйте `React.memo` для статичных компонентов:
        
        ```jsx
        export const Message = React.memo(({ text }) => <Text>{text}</Text>)
        
        ```
        
    - Используйте `FlatList` вместо `map` для длинных списков чатов:
        
        ```jsx
        <FlatList data={messages} renderItem={({ item }) => <Message text={item.text} />} />
        
        ```
        
- **Анимации:**
    - Ограничивайте длительность до 0.3 сек (см. Документацию дизайна).
    - Используйте `useNativeDriver: true` для снижения нагрузки на JS-поток.

### 4.2. Backend (NestJS)

- **GraphQL-запросы:**
    - Решайте проблему N+1 с помощью DataLoader:
        
        ```tsx
        import * as DataLoader from 'dataloader'
        const userLoader = new DataLoader(async (ids) => {
          const users = await this.userService.findByIds(ids)
          return ids.map((id) => users.find((u) => u.id === id))
        })
        
        ```
        
- **Кэширование:**
    - Кэшируйте частые запросы в Redis (TTL 10 сек):
        
        ```tsx
        import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager'
        @UseInterceptors(CacheInterceptor)
        @CacheTTL(10)
        @Query(() => [Chat])
        async getChats() {
          return this.chatService.findAll()
        }
        
        ```
        
- **Асинхронные операции:**
    - Загрузка в AWS S3 через очереди (Kafka):
        
        ```tsx
        @InjectQueue('file-upload') private fileQueue: Queue
        async uploadFile(file: Buffer, filename: string) {
          await this.fileQueue.add('upload', { file, filename })
        }
        
        ```
        

### 4.3. Интеграции

- **Nhost (PostgreSQL):**
    - Индексируйте часто запрашиваемые поля (например, `userId` в `chats`):
        
        ```sql
        CREATE INDEX idx_chats_userId ON chats(userId)
        
        ```
        
- **AWS S3:**
    - Используйте presigned URLs для прямой загрузки с клиента:
        
        ```tsx
        const url = s3.getSignedUrl('putObject', { Bucket: 'brainmessenger-files', Key: filename })
        
        ```
        
- **Firebase:**
    - Ограничивайте частоту уведомлений до 1/сек на пользователя через Redis лимиты.

### 4.4. Инфраструктура

- **Kubernetes:**
    - Настройте автоскейлинг:
        
        ```yaml
        apiVersion: autoscaling/v2
        kind: HorizontalPodAutoscaler
        spec:
          scaleTargetRef:
            kind: Deployment
            name: backend
          minReplicas: 2
          maxReplicas: 10
          metrics:
            - type: Resource
              resource:
                name: cpu
                target:
                  type: Utilization
                  averageUtilization: 70
        
        ```
        
- **CDN:** Используйте Cloudflare для кэширования статичных ресурсов (иконки, шрифты).

---

### 5. Тестирование производительности

### 5.1. Инструменты

- **JMeter:** Нагрузочное тестирование API (TC-17).
- **k6:** Тестирование под 1000 одновременных пользователей.
- **Lighthouse:** Анализ скорости загрузки UI (мобильный/веб).

### 5.2. Сценарии

- **Отправка сообщений:** 1000 пользователей отправляют по 10 сообщений за минуту.
    - Цель: Доставка <1 сек, ошибок <1%.
- **Поиск чатов:** 500 запросов/сек с разными поисковыми строками.
    - Цель: Ответ <300 мс.
- **Загрузка файлов:** 200 одновременных загрузок (5 МБ каждый) в AWS S3.
    - Цель: Завершение <5 сек.

### 5.3. Критерии успеха

- Все целевые показатели достигнуты (см. раздел 2).
- CPU <80%, память <75% при пиковой нагрузке.
- Отсутствие деградации UI (задержки рендеринга <16 мс).

---

### 6. Мониторинг производительности

- **Метрики:**
    - Время ответа API (Prometheus: `http_request_duration_seconds`).
    - Database Latency (Nhost: `pg_query_duration`).
    - FPS в UI (React Native DevTools).
- **Инструменты:** Prometheus + Grafana (см. Руководство по мониторингу).
- **Оповещения:**
    - Latency >500 мс → Slack.
    - Ошибки >1% → Email.

---

### 7. Рекомендации по устранению проблем

- **Высокий latency API:** Проверьте запросы к Nhost, добавьте индексы.
- **Медленный поиск:** Оптимизируйте SQL-запросы или используйте полнотекстовый поиск (PostgreSQL `tsvector`).
- **Перегрузка сервера:** Увеличьте количество подов в Kubernetes.
- **UI-зависания:** Уменьшите количество ререндеров (React Profiler).

---

### 8. Примеры оптимизации

- **Кэширование списка чатов:**
    
    ```tsx
    @CacheTTL(10)
    @Query(() => [Chat])
    async getChats(@Args('userId') userId: string) {
      return this.chatService.findByUserId(userId)
    }
    
    ```
    
- **Асинхронная загрузка файла:**
    
    ```tsx
    async uploadToS3(file: Buffer, filename: string) {
      return this.fileQueue.add('upload', { file, filename })
    }
    
    ```
    

---

### 9. Примечания

- **План:** Полная оптимизация для 1 млн пользователей — Q1 2025 (см. Дорожную карту).
- **Тестирование:** Проводите нагрузочные тесты перед каждым релизом.
- **Масштабирование:** Переход на микросервисы в Q1 2026 улучшит производительность.