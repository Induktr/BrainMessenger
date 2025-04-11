# Спецификация API BrainMessenger

### 1. Общая информация

API BrainMessenger построено на основе GraphQL, что обеспечивает гибкость запросов и оптимизацию передачи данных. Все методы используют HTTPS и требуют аутентификации через JWT-токен в заголовке `Authorization`, где это указано.

**Базовый URL:** `https://api.brainmessenger.com/graphql`

**Формат запросов:** GraphQL-запросы (POST).

**Аутентификация:** JWT-токен в заголовке `Authorization: Bearer <token>` (кроме методов регистрации и логина).

---

### 2. Методы API

### 2.1. Аутентификация

1. **mutation registerUser**
    - **Описание:** Регистрация нового пользователя.
    - **Входные параметры:**
        
        ```
        input RegisterInput {
          email: String!
          password: String!
          name: String!
        }
        
        ```
        
    - **Пример запроса:**
        
        ```graphql
        mutation {
          registerUser(input: { email: "user@example.com", password: "Passw0rd!", name: "John Doe" }) {
            token
            user {
              id
              email
              name
            }
          }
        }
        
        ```
        
    - **Возвращаемые данные:**
        
        ```
        {
          token: String!
          user: {
            id: ID!
            email: String!
            name: String!
          }
        }
        
        ```
        
    - **Ошибки:**
        - `400 Bad Request` — Некорректный формат email или пароля (мин. 8 символов, цифра, спецсимвол).
        - `409 Conflict` — Email уже зарегистрирован.
2. **mutation loginUser**
    - **Описание:** Авторизация пользователя.
    - **Входные параметры:**
        
        ```
        input LoginInput {
          email: String!
          password: String!
        }
        
        ```
        
    - **Пример запроса:**
        
        ```graphql
        mutation {
          loginUser(input: { email: "user@example.com", password: "Passw0rd!" }) {
            token
            user {
              id
              email
              name
            }
          }
        }
        
        ```
        
    - **Возвращаемые данные:**
        
        ```
        {
          token: String!
          user: {
            id: ID!
            email: String!
            name: String!
          }
        }
        
        ```
        
    - **Ошибки:**
        - `401 Unauthorized` — Неверный email или пароль.
3. **mutation logoutUser**
    - **Описание:** Выход из системы (инвалидация токена).
    - **Требуется аутентификация:** Да.
    - **Пример запроса:**
        
        ```graphql
        mutation {
          logoutUser
        }
        
        ```
        
    - **Возвращаемые данные:**
        
        ```
        Boolean!
        
        ```
        
    - **Ошибки:**
        - `401 Unauthorized` — Токен недействителен.

---

### 2.2. Пользователь

1. **query getUser**
    - **Описание:** Получение данных пользователя по ID.
    - **Требуется аутентификация:** Да.
    - **Входные параметры:**
        
        ```
        id: ID!
        
        ```
        
    - **Пример запроса:**
        
        ```graphql
        query {
          getUser(id: "1") {
            id
            email
            name
          }
        }
        
        ```
        
    - **Возвращаемые данные:**
        
        ```
        {
          id: ID!
          email: String!
          name: String!
        }
        
        ```
        
    - **Ошибки:**
        - `404 Not Found` — Пользователь не найден.
2. **mutation updateUser**
    - **Описание:** Обновление профиля пользователя.
    - **Требуется аутентификация:** Да.
    - **Входные параметры:**
        
        ```
        input UserInput {
          name: String
          email: String
          password: String
        }
        id: ID!
        
        ```
        
    - **Пример запроса:**
        
        ```graphql
        mutation {
          updateUser(id: "1", input: { name: "Jane Doe", email: "jane@example.com" }) {
            id
            email
            name
          }
        }
        
        ```
        
    - **Возвращаемые данные:**
        
        ```
        {
          id: ID!
          email: String!
          name: String!
        }
        
        ```
        
    - **Ошибки:**
        - `400 Bad Request` — Некорректный формат данных.
        - `404 Not Found` — Пользователь не найден.
3. **mutation deleteUser**
    - **Описание:** Удаление аккаунта пользователя.
    - **Требуется аутентификация:** Да.
    - **Входные параметры:**
        
        ```
        id: ID!
        
        ```
        
    - **Пример запроса:**
        
        ```graphql
        mutation {
          deleteUser(id: "1")
        }
        
        ```
        
    - **Возвращаемые данные:**
        
        ```
        Boolean!
        
        ```
        
    - **Ошибки:**
        - `404 Not Found` — Пользователь не найден.

---

### 2.3. Чаты

1. **query getChats**
    - **Описание:** Получение списка чатов пользователя.
    - **Требуется аутентификация:** Да.
    - **Пример запроса:**
        
        ```graphql
        query {
          getChats {
            id
            name
            type
          }
        }
        
        ```
        
    - **Возвращаемые данные:**
        
        ```
        [{
          id: ID!
          name: String!
          type: String! # "personal", "group", "channel"
        }]
        
        ```
        
    - **Ошибки:**
        - `401 Unauthorized` — Токен недействителен.
2. **mutation createChat**
    - **Описание:** Создание нового чата.
    - **Требуется аутентификация:** Да.
    - **Входные параметры:**
        
        ```
        input ChatInput {
          name: String!
          type: String! # "personal", "group", "channel"
          userIds: [ID!] # Для личных и групповых чатов
        }
        
        ```
        
    - **Пример запроса:**
        
        ```graphql
        mutation {
          createChat(input: { name: "Friends", type: "group", userIds: ["2", "3"] }) {
            id
            name
            type
          }
        }
        
        ```
        
    - **Возвращаемые данные:**
        
        ```
        {
          id: ID!
          name: String!
          type: String!
        }
        
        ```
        
    - **Ошибки:**
        - `400 Bad Request` — Некорректные данные.
3. **query getMessages**
    - **Описание:** Получение сообщений из чата.
    - **Требуется аутентификация:** Да.
    - **Входные параметры:**
        
        ```
        chatId: ID!
        
        ```
        
    - **Пример запроса:**
        
        ```graphql
        query {
          getMessages(chatId: "1") {
            id
            content
            senderId
            createdAt
          }
        }
        
        ```
        
    - **Возвращаемые данные:**
        
        ```
        [{
          id: ID!
          content: String!
          senderId: ID!
          createdAt: DateTime!
        }]
        
        ```
        
    - **Ошибки:**
        - `404 Not Found` — Чат не найден.
4. **mutation sendMessage**
    - **Описание:** Отправка сообщения в чат.
    - **Требуется аутентификация:** Да.
    - **Входные параметры:**
        
        ```
        chatId: ID!
        content: String!
        
        ```
        
    - **Пример запроса:**
        
        ```graphql
        mutation {
          sendMessage(chatId: "1", content: "Hello!") {
            id
            content
            senderId
            createdAt
          }
        }
        
        ```
        
    - **Возвращаемые данные:**
        
        ```
        {
          id: ID!
          content: String!
          senderId: ID!
          createdAt: DateTime!
        }
        
        ```
        
    - **Ошибки:**
        - `404 Not Found` — Чат не найден.

---

### 2.4. Внешние интеграции (Gmail API)

1. **mutation sendVerificationCode**
    - **Описание:** Отправка кода подтверждения на email.
    - **Входные параметры:**
        
        ```
        email: String!
        
        ```
        
    - **Пример запроса:**
        
        ```graphql
        mutation {
          sendVerificationCode(email: "user@example.com")
        }
        
        ```
        
    - **Возвращаемые данные:**
        
        ```
        Boolean!
        
        ```
        
    - **Ошибки:**
        - `400 Bad Request` — Некорректный email.
2. **mutation verifyEmailCode**
    - **Описание:** Проверка кода подтверждения.
    - **Входные параметры:**
        
        ```
        email: String!
        code: String!
        
        ```
        
    - **Пример запроса:**
        
        ```graphql
        mutation {
          verifyEmailCode(email: "user@example.com", code: "12345678")
        }
        
        ```
        
    - **Возвращаемые данные:**
        
        ```
        Boolean!
        
        ```
        
    - **Ошибки:**
        - `400 Bad Request` — Неверный код.
3. **mutation enableTwoFactorAuth**
    - **Описание:** Включение двухфакторной аутентификации.
    - **Требуется аутентификация:** Да.
    - **Входные параметры:**
        
        ```
        userId: ID!
        
        ```
        
    - **Пример запроса:**
        
        ```graphql
        mutation {
          enableTwoFactorAuth(userId: "1")
        }
        
        ```
        
    - **Возвращаемые данные:**
        
        ```
        Boolean!
        
        ```
        
    - **Ошибки:**
        - `404 Not Found` — Пользователь не найден.
4. **mutation disableTwoFactorAuth**
    - **Описание:** Отключение двухфакторной аутентификации.
    - **Требуется аутентификация:** Да.
    - **Входные параметры:**
        
        ```
        userId: ID!
        
        ```
        
    - **Пример запроса:**
        
        ```graphql
        mutation {
          disableTwoFactorAuth(userId: "1")
        }
        
        ```
        
    - **Возвращаемые данные:**
        
        ```
        Boolean!
        
        ```
        
    - **Ошибки:**
        - `404 Not Found` — Пользователь не найден.
5. **mutation sendTwoFactorCode**
    - **Описание:** Отправка кода для входа с двухфакторной аутентификацией.
    - **Требуется аутентификация:** Да.
    - **Входные параметры:**
        
        ```
        userId: ID!
        
        ```
        
    - **Пример запроса:**
        
        ```graphql
        mutation {
          sendTwoFactorCode(userId: "1")
        }
        
        ```
        
    - **Возвращаемые данные:**
        
        ```
        Boolean!
        
        ```
        
    - **Ошибки:**
        - `404 Not Found` — Пользователь не найден.

---

### 3. Обработка ошибок

- **Формат ошибок:**
    
    ```json
    {
      "errors": [{
        "message": "Описание ошибки",
        "code": "HTTP-код"
      }]
    }
    
    ```
    
- **Общие ошибки:**
    - `401 Unauthorized` — Отсутствует или недействителен токен.
    - `403 Forbidden` — Нет доступа к ресурсу.
    - `500 Internal Server Error` — Ошибка на сервере.

---

### 4. Примечания

- Все даты в формате ISO 8601 (например, "2025-03-13T10:00:00Z").
- Максимальная длина строк (например, `content`) — 500 символов, если не указано иное.
- Для тестирования используйте инструменты вроде Postman или GraphQL Playground.