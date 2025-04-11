# Руководство по развертыванию BrainMessenger

### 1. Общая информация

**Название проекта:** BrainMessenger

**Описание:** Руководство описывает процесс развертывания мессенджера BrainMessenger, включая клиентскую часть, сервер, базу данных и дополнительные сервисы.

**Цель:** Обеспечить запуск приложения в продакшене с высокой доступностью и производительностью.

**Предполагаемая среда:** Облачная инфраструктура (например, Cloudflare, GCP) или выделенные серверы.

---

### 2. Требования к серверу

#### 2.1. Минимальные системные требования

- **Операционная система:** Ubuntu 20.04 LTS (или аналогичная Linux-дистрибуция).
- **Процессор:** 4 ядра (например, Intel Xeon или эквивалент).
- **Оперативная память:** 8 ГБ (рекомендуется 16 ГБ для >1000 пользователей).
- **Диск:** 50 ГБ SSD (рекомендуется 100 ГБ для базы данных и логов).
- **Сеть:** 1 Гбит/с, публичный IP-адрес.

#### 2.2. Зависимости

- **Docker:** Версия 20.10+ (для контейнеризации).
- **Docker Compose:** Версия 1.29+ (для локального тестирования).
- **Kubernetes:** Версия 1.24+ (для оркестрации в продакшене).
- **Terraform:** Версия 1.5+ (для автоматизации инфраструктуры).
- **Node.js:** Версия 18.x (для backend).
- **Git:** Для клонирования репозитория.

#### 2.3. Дополнительные сервисы

- PostgreSQL 15 (база данных, управляется через Neon).
- Redis 7 (кэширование).
- Nginx (обратный прокси, если используется).

---

### 3. Установка зависимостей

1. **Обновите систему:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
2. **Установите Docker:**
   ```bash
   sudo apt install docker.io -y
   sudo systemctl enable docker
   sudo systemctl start docker
   ```
3. **Установите Docker Compose:**
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```
4. **Установите Kubernetes (опционально для продакшена):**
   - Используйте `minikube` для локальной настройки или настройте кластер в облаке (например, Google Kubernetes Engine (GKE)).
5. **Установите Terraform:**
   ```bash
   sudo apt install -y unzip
   wget https://releases.hashicorp.com/terraform/1.5.7/terraform_1.5.7_linux_amd64.zip
   unzip terraform_1.5.7_linux_amd64.zip
   sudo mv terraform /usr/local/bin/
   ```
6. **Установите Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

---

### 4. Конфигурация окружения

#### 4.1. Клонирование репозитория

```bash
git clone https://github.com/xAI/BrainMessenger.git
cd BrainMessenger
```

#### 4.2. Переменные окружения

Переменные окружения используются для конфигурации BrainMessenger, обеспечивая гибкость и безопасность при развертывании. Они задаются в файле `.env` в корне проекта (для монолита) или в манифестах Kubernetes (для микросервисов). Пример файла `.env.example` доступен в репозитории.

##### 4.1. Общие переменные (Монолит и Микросервисы)

| Переменная | Описание | Пример значения | Обязательна | Примечание |
| --- | --- | --- | --- | --- |
| `NODE_ENV` | Режим окружения | `production` / `development` | Да | Влияет на логи и оптимизацию |
| `PORT` | Порт приложения | `3000` | Нет | По умолчанию 3000 |
| `APP_URL` | Базовый URL приложения | `https://brainmessenger.com` | Да | Для CORS и редиректов |
| `JWT_SECRET` | Секрет для JWT-токенов | `your-secret-key` | Да | Минимум 32 символа |
| `LOG_LEVEL` | Уровень логирования (Winston) | `info` / `debug` | Нет | По умолчанию `info` |

##### 4.2. Интеграция с Neon

| Переменная | Описание | Пример значения | Обязательна | Примечание |
| --- | --- | --- | --- | --- |
| `NEON_DATABASE_URL` | URL подключения к Neon | `postgresql://user:password@neon-host:port/dbname` | Да | Из Neon Dashboard |

##### 4.3. Интеграция с Cloudflare R2

| Переменная | Описание | Пример значения | Обязательна | Примечание |
| --- | --- | --- | --- | --- |
| `R2_ACCESS_KEY` | Ключ доступа Cloudflare R2 | `your-access-key` | Да | Из Cloudflare Dashboard |
| `R2_SECRET_KEY` | Секретный ключ Cloudflare R2 | `your-secret-key` | Да | Хранить в секретах |
| `R2_ENDPOINT` | Эндпоинт Cloudflare R2 | `https://<account-id>.r2.cloudflarestorage.com` | Да | Из Cloudflare Dashboard |
| `R2_BUCKET` | Имя бакета R2 | `brainmessenger-files` | Да | Уникальное имя |

##### 4.4. Интеграция с Firebase (Уведомления)

| Переменная | Описание | Пример значения | Обязательна | Примечание |
| --- | --- | --- | --- | --- |
| `FIREBASE_API_KEY` | Ключ API Firebase | `your-firebase-key` | Да | Из Firebase Console |
| `FIREBASE_PROJECT_ID` | ID проекта Firebase | `brainmessenger-123` | Да | Для идентификации |

##### 4.5. Redis (Кэширование и лимиты)

| Переменная | Описание | Пример значения | Обязательна | Примечание |
| --- | --- | --- | --- | --- |
| `REDIS_HOST` | Хост Redis | `redis` / `localhost` | Да | Имя сервиса в K8s |
| `REDIS_PORT` | Порт Redis | `6379` | Да | По умолчанию 6379 |
| `REDIS_PASSWORD` | Пароль Redis (опционально) | `your-redis-password` | Нет | Для защищённого доступа |

##### 4.6. Микросервисы (Q1 2026)

| Переменная | Описание | Пример значения | Обязательна | Примечание |
| --- | --- | --- | --- | --- |
| `SERVICE_NAME` | Имя микросервиса | `auth` / `chat` | Да | Для идентификации в логах |
| `KAFKA_BROKER` | Адрес брокера Kafka | `kafka:9092` | Да | Для асинхронной связи |
| `KAFKA_GROUP_ID` | ID группы потребителей Kafka | `brainmessenger-group` | Да | Уникальный для сервиса |
| `API_GATEWAY_URL` | URL API Gateway | `http://gateway:4000` | Да | Для маршрутизации |

##### 4.7. AI-интеграции (Q2 2026)

| Переменная | Описание | Пример значения | Обязательна | Примечание |
| --- | --- | --- | --- | --- |
| `CLAUDE_API_KEY` | Ключ API Claude (премиум) | `sk-...` | Нет | Для пула премиум-ключей |
| `OPENAI_API_KEY` | Ключ API ChatGPT (премиум) | `sk-...` | Нет | Для пула премиум-ключей |
| `GEMINI_API_KEY` | Ключ API Gemini (опционально) | `your-gemini-key` | Нет | Для бесплатных пользователей |
| `AI_REQUEST_LIMIT` | Лимит запросов для премиум | `50` | Нет | По умолчанию 50/день |

##### 4.8. Пример `.env` для монолита (v1.0)

```bash
# Общие
NODE_ENV=production
PORT=3000
APP_URL=https://brainmessenger.com
JWT_SECRET=your-very-secure-secret-key-32-chars
LOG_LEVEL=info

# Neon
NEON_DATABASE_URL=postgresql://user:password@neon-host:port/dbname

# Cloudflare R2
R2_ACCESS_KEY=your-access-key
R2_SECRET_KEY=your-secret-key
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_BUCKET=brainmessenger-files

# Firebase
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_PROJECT_ID=brainmessenger-123

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

##### 4.9. Пример конфигурации для микросервиса (Chat, Q1 2026)

```yaml
# Kubernetes Secret (chat-service-secret.yaml)
apiVersion: v1
kind: Secret
metadata:
  name: chat-service-secret
type: Opaque
data:
  SERVICE_NAME: Y2hhdA== # "chat" в base64
  NEON_DATABASE_URL: cG9zdGdyZXNxbDovL3VzZXI6cGFzc3dvcmRAbmVvbi1ob3N0OjU0MzIvZGJuYW1l # "postgresql://user:password@neon-host:port/dbname"
  R2_ACCESS_KEY: eW91ci1hY2Nlc3Mta2V5 # "your-access-key"
  R2_SECRET_KEY: eW91ci1zZWNyZXQta2V5 # "your-secret-key"
  REDIS_HOST: cmVkaXM= # "redis"
  KAFKA_BROKER: a2Fma2E6OTA5Mg== # "kafka:9092"
```

##### 4.10. Рекомендации

- **Безопасность:**
  - Не коммитьте `.env` в Git — используйте секреты Kubernetes или Vault.
  - Шифруйте ключи в Neon (см. Руководство по безопасности).
- **Гибкость:**
  - Для локальной разработки используйте `.env.local`.
  - Для продакшена задавайте через CI/CD (GitHub Actions).
- **Проверка:**
  - Перед деплоем проверяйте наличие всех обязательных переменных:
    ```bash
    if [ -z "$NEON_DATABASE_URL" ]; then echo "NEON_DATABASE_URL is missing"; exit 1; fi
    ```

#### 4.3. Настройка базы данных

1. **Используйте Neon для PostgreSQL:**
   - Создайте проект в Neon через их консоль (`https://neon.tech`).
   - Получите строку подключения (`NEON_DATABASE_URL`) из Neon Dashboard.
   - Импортируйте схему базы данных:
     ```bash
     psql $NEON_DATABASE_URL -f database/schema.sql
     ```
2. **Примените миграции:**
   ```bash
   cd backend
   npm install
   npx prisma migrate deploy
   ```

#### 4.4. Настройка Redis

```bash
sudo apt install redis-server -y
sudo systemctl start redis
sudo systemctl enable redis
```

---

### 5. Шаги развертывания

#### 5.1. Локальное развертывание (Docker Compose)

1. Убедитесь, что `.env` настроен.
2. Запустите приложение:
   ```bash
   docker-compose up -d
   ```
3. Проверьте контейнеры:
   ```bash
   docker ps
   ```

#### 5.2. Продакшен-развертывание (Kubernetes)

1. Подготовьте инфраструктуру с Terraform:
   ```bash
   cd infrastructure
   terraform init
   terraform apply
   ```
   - Укажите провайдера (GCP, DigitalOcean) и настройки кластера в `main.tf`.
2. Скомпилируйте Docker-образы:
   ```bash
   docker build -t brainmessenger-backend ./backend
   docker build -t brainmessenger-frontend ./frontend
   docker tag brainmessenger-backend your-registry/brainmessenger-backend:latest
   docker tag brainmessenger-frontend your-registry/brainmessenger-frontend:latest
   docker push your-registry/brainmessenger-backend:latest
   docker push your-registry/brainmessenger-frontend:latest
   ```
3. Примените Kubernetes-манифесты:
   ```bash
   kubectl apply -f k8s/
   ```
   - Файлы `k8s/` должны включать `deployment.yaml`, `service.yaml`, `ingress.yaml`.

#### 5.3. Настройка Nginx (опционально)

Если используется обратный прокси:

1. Установите Nginx:
   ```bash
   sudo apt install nginx -y
   ```
2. Настройте конфигурацию `/etc/nginx/sites-available/brainmessenger`:
   ```
   server {
       listen 80;
       server_name api.brainmessenger.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```
3. Активируйте и перезапустите:
   ```bash
   sudo ln -s /etc/nginx/sites-available/brainmessenger /etc/nginx/sites-enabled/
   sudo systemctl restart nginx
   ```

---

### 6. Проверка работоспособности

1. **Локальная проверка:**
   ```bash
   curl http://localhost:3000/health
   ```
   Ожидаемый ответ: `{"status": "ok"}`.
2. **Продакшен-проверка:**
   ```bash
   curl https://api.brainmessenger.com/health
   ```
   Ожидаемый ответ: `{"status": "ok"}`.
3. **Логи:**
   ```bash
   docker logs brainmessenger-backend
   ```
4. **База данных:**
   ```bash
   psql $NEON_DATABASE_URL -c "SELECT * FROM users LIMIT 1;"
   ```
5. **Kubernetes:**
   ```bash
   kubectl get pods
   kubectl get services
   ```

---

### 7. Примечания

- **SSL:** Для продакшена настройте сертификаты через Let’s Encrypt или другой CA.
  ```bash
  sudo apt install certbot python3-certbot-nginx
  sudo certbot --nginx -d api.brainmessenger.com
  ```
- **Масштабирование:** Увеличьте реплики в `deployment.yaml` для поддержки нагрузки.
- **Резервное копирование:** Настройте ежедневный бэкап PostgreSQL через Neon:
  - Используйте встроенные инструменты Neon для создания бэкапов (см. документацию Neon).

---

### Итог изменений
- **Nhost** заменён на **Neon** в разделе 4.2 (Переменные окружения) и 4.3 (Настройка базы данных).
- **AWS S3** заменён на **Cloudflare R2** в разделе 4.2 (Переменные окружения).
- Удалены упоминания других сервисов AWS (например, AWS EKS заменён на Google Kubernetes Engine (GKE)).
- Обновлены примеры `.env` и Kubernetes Secret для соответствия новым сервисам (Neon, Cloudflare R2).
- В разделе 4.3 добавлена инструкция по использованию Neon вместо локальной установки PostgreSQL.
- В разделе 7 обновлены рекомендации по резервному копированию для использования инструментов Neon.
- Сохранена вся структура документации, включая заголовки, подзаголовки и форматирование.