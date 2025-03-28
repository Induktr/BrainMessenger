# Руководство по оптимизации BrainMessenger

### 1. Введение

**Название проекта:** BrainMessenger

**Описание:** Документ описывает подходы, утилиты и инструменты для оптимизации производительности BrainMessenger — мессенджера с поддержкой чатов, звонков и AI-интеграций на платформах Android, Windows и веб.

**Цель:** Обеспечить высокую производительность, масштабируемость и надёжность приложения, особенно при росте числа пользователей (цель — 1 миллион активных пользователей).

**Аудитория:** Backend-, frontend- и DevOps-разработчики, которые занимаются оптимизацией и масштабированием проекта.

**Связанные документы:**

- "Руководство по разработке BrainMessenger" — базовые процессы разработки.
- "Руководство по безопасности BrainMessenger" — рекомендации по безопасности.
- "Документация звуков" — работа со звуками в приложении.

---

### 2. Общий принцип оптимизации

Оптимизация — это итеративный процесс:

1. **Измерение:** Определите узкие места (bottlenecks) с помощью профилирования и мониторинга (Sentry, Prometheus, V8 Profiler).
2. **Оптимизация:** Примените конкретные техники или инструменты из этого руководства.
3. **Повторное измерение:** Убедитесь, что оптимизация дала эффект и не вызвала регрессий.

---

### 3. Оптимизация обработки изображений

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
    
4. Асинхронность: Вынесите обработку в фоновые задачи через Kafka (см. раздел 8).

**Совет:** Всегда удаляйте EXIF-метаданные для экономии размера.

---

### 4. Оптимизация базы данных (Nhost/PostgreSQL)

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

**Подход 4: Материализованные представления**

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
    

**Подход 5: Партиционирование таблиц**

**Почему:** Ускоряет запросы для больших таблиц.

**Шаги:** Разделите таблицу `Message` по `createdAt` (например, по месяцам).

---

### 5. Оптимизация GraphQL API (NestJS + Prisma)

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

---

### 6. Оптимизация backend логики (NestJS)

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

---

### 7. Кэширование (Redis)

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

---

### 8. Асинхронная обработка (Kafka)

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
    

---

### 9. Оптимизация push-уведомлений (Firebase FCM)

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
    

---

### 10. Оптимизация взаимодействия клиент-API-БД

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
    

---

### 11. Оптимизация аутентификации

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
    

---

### 12. Оптимизация чатов (WebSocket)

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
    

---

### 13. Оптимизация анимаций

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
    

---

### 14. Мониторинг с Prometheus и Grafana

**Инструменты:** Prometheus (сбор и хранение метрик), Grafana (визуализация).

**Почему:** Позволяет отслеживать производительность системы в реальном времени, выявлять узкие места и прогнозировать проблемы (например, рост задержек API или перегрузку сервера).

**Области применения:** Мониторинг API (задержки, ошибки), базы данных (время запросов), WebSocket (активные соединения), инфраструктуры (CPU, память).

**Шаги по внедрению:**

1. **Установите Prometheus:**
    - Разверните Prometheus в Kubernetes:
        
        ```yaml
        apiVersion: apps/v1
        kind: Deployment
        metadata:
          name: prometheus
        spec:
          replicas: 1
          selector:
            matchLabels:
              app: prometheus
          template:
            metadata:
              labels:
                app: prometheus
            spec:
              containers:
              - name: prometheus
                image: prom/prometheus:latest
                args:
                  - "--config.file=/etc/prometheus/prometheus.yml"
                ports:
                  - containerPort: 9090
                volumeMounts:
                  - name: config-volume
                    mountPath: /etc/prometheus
              volumes:
                - name: config-volume
                  configMap:
                    name: prometheus-config
        
        ```
        
    - Настройте `prometheus.yml` для сбора метрик с NestJS, Redis и PostgreSQL:
        
        ```yaml
        global:
          scrape_interval: 15s
        scrape_configs:
          - job_name: 'brainmessenger-api'
            static_configs:
              - targets: ['api-service:3000'] # Сервис NestJS
          - job_name: 'redis'
            static_configs:
              - targets: ['redis:6379']
          - job_name: 'postgres'
            static_configs:
              - targets: ['postgres-exporter:9187']
        
        ```
        
2. **Интегрируйте Prometheus в NestJS:**
    - Установите библиотеку:
        
        ```bash
        npm install @willsoto/nestjs-prometheus
        
        ```
        
    - Настройте метрики (например, задержки запросов):
        
        ```tsx
        import { PrometheusModule } from '@willsoto/nestjs-prometheus'
        
        @Module({
          imports: [PrometheusModule.register()],
        })
        export class AppModule {}
        
        ```
        
    - Добавьте кастомные метрики:
        
        ```tsx
        import { makeHistogramProvider } from '@willsoto/nestjs-prometheus'
        
        export const requestLatency = makeHistogramProvider({
          name: 'http_request_duration_seconds',
          help: 'Latency of HTTP requests in seconds',
          labelNames: ['method', 'route', 'status'],
          buckets: [0.1, 0.5, 1, 2, 5],
        })
        
        ```
        
    - Используйте в middleware:
        
        ```tsx
        @Injectable()
        class MetricsMiddleware implements NestMiddleware {
          constructor(@InjectMetric('http_request_duration_seconds') private requestLatency: Histogram<string>) {}
        
          use(req: Request, res: Response, next: NextFunction) {
            const start = Date.now()
            res.on('finish', () => {
              const duration = (Date.now() - start) / 1000
              this.requestLatency.observe(
                { method: req.method, route: req.path, status: res.statusCode },
                duration
              )
            })
            next()
          }
        }
        
        ```
        
3. **Установите Grafana:**
    - Разверните Grafana в Kubernetes:
        
        ```yaml
        apiVersion: apps/v1
        kind: Deployment
        metadata:
          name: grafana
        spec:
          replicas: 1
          selector:
            matchLabels:
              app: grafana
          template:
            metadata:
              labels:
                app: grafana
            spec:
              containers:
              - name: grafana
                image: grafana/grafana:latest
                ports:
                  - containerPort: 3000
        
        ```
        
    - Подключите Prometheus как источник данных в Grafana:
        - Зайдите в Grafana (по умолчанию: `admin/admin`).
        - Добавьте источник данных: `Prometheus`, укажите URL (например, `http://prometheus:9090`).
4. **Создайте дашборды в Grafana:**
    - **API Performance:** Метрики задержек (`http_request_duration_seconds`), коды ответов, количество запросов.
    - **Database Performance:** Время выполнения запросов PostgreSQL (через `postgres-exporter`), количество соединений.
    - **Infrastructure:** Использование CPU, памяти, диска (через `node-exporter`).
    - Пример запроса для задержек API:
        
        ```
        rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])
        
        ```
        

**Рекомендации:**

- Настройте алерты в Prometheus (например, если задержка API превышает 1 секунду).
- Используйте готовые дашборды Grafana (например, для Node.js, Redis).
- Регулярно анализируйте метрики для выявления узких мест.

---

### 15. Оптимизация CI/CD

**Цель:** Ускорить процессы сборки, тестирования и деплоя, минимизировать время ожидания разработчиков и обеспечить стабильность продакшен-окружения.

**Инструменты:** Turborepo (уже используется), GitHub Actions, Docker.

### 15.1. Оптимизация сборки с Turborepo

**Почему:** Turborepo кэширует задачи и параллелизирует выполнение, что ускоряет сборку и тестирование в монорепозитории.

**Шаги:**

1. **Настройте кэширование:**
    - Убедитесь, что `turbo.json` настроен для кэширования:
        
        ```json
        {
          "pipeline": {
            "build": {
              "dependsOn": ["^build"],
              "outputs": ["dist/**", ".next/**"]
            },
            "test": {
              "dependsOn": ["^build"],
              "outputs": []
            }
          }
        }
        
        ```
        
    - Используйте `-cache-dir` для хранения кэша:
        
        ```bash
        turbo run build --cache-dir=".turbo"
        
        ```
        
2. **Параллельное выполнение:**
    - Укажите количество параллельных задач:
        
        ```bash
        turbo run build test --parallel --concurrency=10
        
        ```
        
3. **Инкрементальная сборка:**
    - Turborepo автоматически пропускает задачи, если входные файлы не изменились. Убедитесь, что зависимости в `package.json` указаны корректно.

**Совет:** Используйте Turborepo Remote Cache (например, Vercel) для общего кэша между разработчиками и CI/CD.

### 15.2. Оптимизация CI/CD с GitHub Actions

**Почему:** GitHub Actions позволяет автоматизировать сборку, тестирование и деплой, а также оптимизировать время выполнения пайплайнов.

**Шаги:**

1. **Настройте базовый пайплайн:**
    - Пример `.github/workflows/ci.yml`:
        
        ```yaml
        name: CI
        on:
          push:
            branches: [main, develop]
          pull_request:
            branches: [main, develop]
        jobs:
          build-and-test:
            runs-on: ubuntu-latest
            steps:
              - uses: actions/checkout@v4
              - uses: actions/setup-node@v4
                with:
                  node-version: '22'
                  cache: 'npm'
              - name: Install dependencies
                run: npm ci
              - name: Build
                run: npm run build -- --cache-dir=".turbo"
              - name: Test
                run: npm run test
        
        ```
        
2. **Кэширование зависимостей:**
    - Используйте кэш для `node_modules` и Turborepo:
        
        ```yaml
        - name: Cache node modules
          uses: actions/cache@v3
          with:
            path: |
              node_modules
              .turbo
            key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
            restore-keys: |
              ${{ runner.os }}-node-
        
        ```
        
3. **Параллельное выполнение:**
    - Разделите задачи на параллельные джобы (например, для `mobile-desktop`, `web`, `backend`):
        
        ```yaml
        jobs:
          build-mobile-desktop:
            runs-on: ubuntu-latest
            steps:
              - uses: actions/checkout@v4
              - uses: actions/setup-node@v4
                with:
                  node-version: '22'
              - name: Install dependencies
                run: npm ci
              - name: Build mobile-desktop
                run: turbo run build --filter=mobile-desktop
          build-web:
            runs-on: ubuntu-latest
            steps:
              - uses: actions/checkout@v4
              - uses: actions/setup-node@v4
                with:
                  node-version: '22'
              - name: Install dependencies
                run: npm ci
              - name: Build web
                run: turbo run build --filter=web
        
        ```
        
4. **Оптимизация тестов:**
    - Используйте `jest --watch` только локально, а в CI запускайте тесты однократно:
        
        ```yaml
        - name: Run tests
          run: turbo run test --filter=... -- --ci
        
        ```
        
    - Разделите тесты на группы для параллельного выполнения:
        
        ```yaml
        - name: Run unit tests
          run: turbo run test:unit
        - name: Run integration tests
          run: turbo run test:integration
        
        ```
        
5. **Автоматизация деплоя:**
    - Добавьте деплой в пайплайн (например, для `web` на Vercel):
        
        ```yaml
        deploy-web:
          needs: build-web
          runs-on: ubuntu-latest
          if: github.ref == 'refs/heads/main'
          steps:
            - uses: actions/checkout@v4
            - name: Deploy to Vercel
              run: npx vercel deploy --prod
              env:
                VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        
        ```
        

**Рекомендации:**

- Используйте `actions/setup-node` с кэшированием для ускорения установки зависимостей.
- Настройте уведомления в Slack о сбоях пайплайна:
    
    ```yaml
    - name: Notify Slack on failure
      if: failure()
      uses: slackapi/slack-github-action@v1.24.0
      with:
        slack-bot-token: ${{ secrets.SLACK_BOT_TOKEN }}
        channel-id: 'dev-team'
        text: 'CI pipeline failed for BrainMessenger! Check the logs.'
    
    ```
    
- Ограничьте выполнение пайплайнов для PR, используя `if` условия, чтобы не тратить ресурсы на ненужные проверки.

### 15.3. Оптимизация Docker-образов

**Почему:** Меньший размер образов и более быстрая сборка ускоряют деплой и снижают нагрузку на инфраструктуру.

**Шаги:**

1. **Используйте многоступенчатую сборку:**
    - Пример `Dockerfile` для `backend`:
        
        ```
        # Этап 1: Сборка
        FROM node:22-slim AS builder
        WORKDIR /app
        COPY package*.json ./
        RUN npm ci
        COPY . .
        RUN npm run build
        
        # Этап 2: Продакшен-образ
        FROM node:22-slim
        WORKDIR /app
        COPY --from=builder /app/dist ./dist
        COPY package*.json ./
        RUN npm ci --only=production
        CMD ["node", "dist/main.js"]
        
        ```
        
    - Это уменьшает размер образа, исключая dev-зависимости и исходный код.
2. **Оптимизируйте слои:**
    - Копируйте `package.json` и устанавливайте зависимости перед копированием остального кода, чтобы кэшировать слой зависимостей:
        
        ```
        COPY package*.json ./
        RUN npm ci
        COPY . .
        
        ```
        
3. **Используйте `.dockerignore`:**
    - Исключите ненужные файлы:
        
        ```
        node_modules
        .turbo
        dist
        .git
        *.md
        
        ```
        

**Рекомендации:**

- Тестируйте образы локально перед деплоем:
    
    ```bash
    docker build -t brainmessenger-backend .
    docker run -p 3000:3000 brainmessenger-backend
    
    ```
    
- Используйте теги для версионирования образов:
    
    ```bash
    docker build -t brainmessenger-backend:${{ github.sha }} .
    
    ```
    

---

### 16. Оптимизация фронтенда

**Цель:** Ускорить загрузку приложения, уменьшить размер бандла и улучшить пользовательский опыт (например, сократить время до первой отрисовки — First Contentful Paint).

**Области применения:** Веб-приложение (Next.js), мобильное и десктопное приложение (React Native).

### 16.1. Code Splitting в Next.js

**Почему:** Code splitting позволяет загружать только необходимый код для текущей страницы, уменьшая размер бандла и ускоряя загрузку.

**Шаги:**

1. **Динамический импорт страниц:**
    - Используйте `next/dynamic` для ленивой загрузки страниц:
        
        ```tsx
        import dynamic from 'next/dynamic'
        
        const ChatPage = dynamic(() => import('../pages/chat/[id]'), {
          ssr: false, // Отключить SSR для этой страницы, если не требуется
          loading: () => <p>Loading...</p>,
        })
        
        export default function ChatWrapper() {
          return <ChatPage />
        }
        
        ```
        
2. **Динамический импорт компонентов:**
    - Лениво загружайте тяжёлые компоненты:
        
        ```tsx
        const HeavyComponent = dynamic(() => import('../components/HeavyComponent'), {
          loading: () => <p>Loading...</p>,
        })
        
        export default function Page() {
          return (
            <div>
              <h1>Chat Page</h1>
              <HeavyComponent />
            </div>
          )
        }
        
        ```
        
3. **Оптимизация маршрутов:**
    - Используйте `getStaticPaths` и `getStaticProps` для генерации страниц на этапе сборки:
        
        ```tsx
        export async function getStaticPaths() {
          return {
            paths: [{ params: { id: '1' } }, { params: { id: '2' } }],
            fallback: 'blocking',
          }
        }
        
        export async function getStaticProps({ params }) {
          const chat = await fetchChat(params.id) // Пример
          return { props: { chat } }
        }
        
        ```
        

**Рекомендации:**

- Используйте `next/dynamic` для всех тяжёлых страниц и компонентов (например, графики, редакторы).
- Анализируйте размер бандла с помощью `next build` и `@next/bundle-analyzer`:
    
    ```bash
    npm install @next/bundle-analyzer
    
    ```
    
    ```json
    {
      "scripts": {
        "analyze": "ANALYZE=true next build"
      }
    }
    
    ```
    

### 16.2. Ленивая загрузка в React Native

**Почему:** Уменьшает время запуска приложения, загружая только необходимые компоненты.

**Шаги:**

1. **Динамический импорт компонентов:**
    - Используйте `React.lazy` и `Suspense`:
        
        ```tsx
        import React, { Suspense, lazy } from 'react'
        
        const ChatScreen = lazy(() => import('./screens/ChatScreen'))
        
        export default function App() {
          return (
            <Suspense fallback={<Text>Loading...</Text>}>
              <ChatScreen />
            </Suspense>
          )
        }
        
        ```
        
2. **Ленивая загрузка изображений:**
    - Используйте `react-native-fast-image` для оптимизации загрузки изображений:
        
        ```bash
        npm install react-native-fast-image
        
        ```
        
        ```tsx
        import FastImage from 'react-native-fast-image'
        
        export default function MessageBubble({ imageUrl }) {
          return (
            <FastImage
              source={{ uri: imageUrl }}
              style={{ width: 200, height: 200 }}
              resizeMode={FastImage.resizeMode.cover}
            />
          )
        }
        
        ```
        

**Рекомендации:**

- Применяйте ленивую загрузку для экранов, которые не отображаются сразу (например, настройки, профиль).
- Используйте `FastImage.priority` для приоритизации загрузки важных изображений:
    
    ```tsx
    source={{
      uri: imageUrl,
      priority: FastImage.priority.high,
    }}
    
    ```
    

### 16.3. Минимизация бандла

**Почему:** Меньший размер бандла ускоряет загрузку приложения, особенно на медленных соединениях.

**Шаги:**

1. **Удаление неиспользуемого кода (Tree Shaking):**
    - Убедитесь, что `sideEffects` в `package.json` настроен корректно:
        
        ```json
        {
          "sideEffects": false
        }
        
        ```
        
    - Используйте ES-модули вместо CommonJS для лучшего tree shaking.
2. **Оптимизация зависимостей:**
    - Замените тяжёлые библиотеки на лёгкие альтернативы (например, `moment` на `dayjs`):
        
        ```bash
        npm uninstall moment
        npm install dayjs
        
        ```
        
        ```tsx
        import dayjs from 'dayjs'
        
        const formattedDate = dayjs().format('YYYY-MM-DD')
        
        ```
        
3. **Сжатие бандла:**
    - В Next.js сжатие включено по умолчанию (Gzip). Для React Native используйте `metro.config.js` для минимизации:
        
        ```jsx
        module.exports = {
          transformer: {
            minifierConfig: {
              keep_classnames: false,
              keep_fnames: false,
              mangle: true,
              output: {
                comments: false,
              },
            },
          },
        }
        
        ```
        

**Рекомендации:**

- Регулярно анализируйте размер бандла с помощью `@next/bundle-analyzer` (для Next.js) или `react-native-bundle-visualizer` (для React Native).
- Избегайте импорта всего модуля, если нужна только часть:
    
    ```tsx
    // Плохо
    import * as lodash from 'lodash'
    // Хорошо
    import debounce from 'lodash/debounce'
    
    ```
    

---

### 17. Масштабирование базы данных (репликация и шардинг)

**Цель:** Обеспечить высокую доступность, производительность и масштабируемость базы данных при росте числа пользователей и объёма данных.

**Инструменты:** PostgreSQL (Nhost), репликация, шардинг.

### 17.1. Репликация

**Почему:** Репликация создаёт копии базы данных (реплики) для распределения нагрузки на чтение и повышения отказоустойчивости.

**Типы репликации:**

- **Master-Slave:** Один мастер (для записи), несколько слейвов (для чтения).
- **Master-Master:** Все узлы могут принимать записи (сложнее в управлении).

**Шаги по настройке Master-Slave репликации в Nhost/PostgreSQL:**

1. **Настройте мастер:**
    - В Nhost репликация настраивается через их платформу. Обратитесь к документации Nhost для включения репликации.
    - Если используете собственный PostgreSQL, настройте `postgresql.conf` на мастере:
        
        ```
        wal_level = replica
        max_wal_senders = 10
        wal_keep_size = 64
        
        ```
        
    - Настройте `pg_hba.conf` для разрешения подключений от слейвов:
        
        ```
        host replication replicator <slave-ip>/32 md5
        
        ```
        
2. **Настройте слейв:**
    - Создайте слейв-сервер и настройте `recovery.conf` (для PostgreSQL < 12) или `standby.signal` (для PostgreSQL 12+):
        
        ```
        standby_mode = 'on'
        primary_conninfo = 'host=<master-ip> port=5432 user=replicator password=<password>'
        
        ```
        
    - Скопируйте данные с мастера:
        
        ```bash
        pg_basebackup -h <master-ip> -D /var/lib/postgresql/data -U replicator -P
        
        ```
        
3. **Настройте Prisma для чтения с реплик:**
    - Используйте несколько подключений в `prisma.service.ts`:
        
        ```tsx
        @Injectable()
        class PrismaService extends PrismaClient {
          private readClient: PrismaClient
        
          constructor() {
            super({ datasources: { db: { url: process.env.DATABASE_URL } } })
            this.readClient = new PrismaClient({
              datasources: { db: { url: process.env.READ_REPLICA_URL } },
            })
          }
        
          async getUser(id: string) {
            return this.readClient.user.findUnique({ where: { id } })
          }
        
          async createUser(data: Prisma.UserCreateInput) {
            return this.user.create({ data })
          }
        }
        
        ```
        

**Рекомендации:**

- Используйте реплики только для операций чтения (например, получение списка чатов).
- Настройте мониторинг задержки репликации (replication lag) через Prometheus и `pg_stat_replication`.
- В Nhost репликация может быть настроена автоматически — проверьте их документацию.

### 17.2. Шардинг

**Почему:** Шардинг разделяет данные на части (шарды), распределяя их по разным серверам, что позволяет масштабировать как чтение, так и запись.

**Подход:** Логический шардинг (на уровне приложения) или нативный шардинг (с помощью PostgreSQL Citus).

**Шаги по настройке логического шардинга:**

1. **Выберите ключ шардирования:**
    - Для BrainMessenger подойдёт `chatId` или `userId`, так как данные чатов и пользователей можно разделить по этим ключам.
    - Пример: Шардируйте таблицу `Message` по `chatId`.
2. **Определите количество шардов:**
    - Начните с 4 шардов (можно увеличить позже).
    - Распределите `chatId` по шардам с помощью хэш-функции:
        
        ```tsx
        const getShardId = (chatId: string) => {
          const hash = Number(BigInt.asUintN(32, BigInt(chatId))) // Простой хэш
          return hash % 4 // 4 шарда
        }
        
        ```
        
3. **Настройте Prisma для работы с шардами:**
    - Создайте отдельные подключения для каждого шарда:
        
        ```tsx
        @Injectable()
        class ShardedPrismaService {
          private shards: PrismaClient[] = []
        
          constructor() {
            for (let i = 0; i < 4; i++) {
              this.shards[i] = new PrismaClient({
                datasources: { db: { url: process.env[`SHARD_${i}_URL`] } },
              })
            }
          }
        
          getShard(chatId: string) {
            const shardId = getShardId(chatId)
            return this.shards[shardId]
          }
        
          async getMessages(chatId: string) {
            const shard = this.getShard(chatId)
            return shard.message.findMany({ where: { chatId } })
          }
        
          async createMessage(data: Prisma.MessageCreateInput) {
            const shard = this.getShard(data.chatId)
            return shard.message.create({ data })
          }
        }
        
        ```
        

**Шаги по настройке шардинга с Citus (альтернатива):**

1. **Установите Citus:**
    - Nhost не поддерживает Citus напрямую, поэтому вам нужно развернуть PostgreSQL с Citus отдельно.
    - Установите Citus на сервере PostgreSQL:
        
        ```bash
        sudo apt-get install postgresql-15-citus-11.0
        
        ```
        
    - Включите расширение в `postgresql.conf`:
        
        ```
        shared_preload_libraries = 'citus'
        
        ```
        
2. **Настройте шарды:**
    - Создайте распределённую таблицу:
        
        ```sql
        CREATE TABLE messages (
          id TEXT PRIMARY KEY,
          content TEXT,
          created_at TIMESTAMP,
          chat_id TEXT,
          user_id TEXT
        );
        
        SELECT create_distributed_table('messages', 'chat_id');
        
        ```
        
3. **Подключите Prisma:**
    - Используйте одну точку подключения, так как Citus автоматически распределяет запросы.

**Рекомендации:**

- Начинайте с логического шардинга, так как он проще в реализации и не требует изменения инфраструктуры.
- Переходите на Citus, если объём данных превысит 100 миллионов записей в таблице `Message`.
- Тестируйте производительность шардирования с помощью нагрузочного тестирования (например, `k6`).
- Убедитесь, что ключ шардирования (`chatId`) равномерно распределяет данные, чтобы избежать "горячих" шардов.

---

### 18. Примечания

- **Когда применять:** Начинайте с измерения производительности. Внедряйте оптимизации только для выявленных узких мест.
- **Масштабирование:** Некоторые подходы (например, партиционирование таблиц, шардинг) актуальны только для больших объёмов данных (миллиарды записей).
- **Мониторинг:** Регулярно проверяйте метрики в Grafana для выявления проблем.
- **CI/CD:** Постоянно анализируйте время выполнения пайплайнов и оптимизируйте узкие места.
- **Фронтенд:** Используйте инструменты анализа бандла для контроля размера приложения.
- **База данных:** Тестируйте репликацию и шардинг в staging-окружении перед продакшеном.
- **Вопросы:** Обращайтесь в Slack (#dev-team) или к техлиду.