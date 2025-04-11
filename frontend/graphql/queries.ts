import { gql } from '@apollo/client';

// User queries
export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    # Предполагаем, что resolver getCurrentUser возвращает поля из UserDto
    getCurrentUser {
      id
      name # Используем name вместо username
      email
      # bio, username (если отличается от name), status - будут добавлены позже
    }
  }
`;

// Updated query name, ID type, and fields based on UserDto
export const GET_USER = gql`
  query GetUser($id: ID!) { # Changed from GetUserById, ID type is correct (string)
    getUser(id: $id) { # Changed from getUserById, assuming resolver maps ID string to service call
      id
      name # Changed from username
      email
      # avatar and status removed as they are not in UserDto/Prisma Model
    }
  }
`;

// Chat queries
export const GET_CHATS = gql`
  query GetChats {
    getChats {
      id
      name
      type
      user { # Added user field based on ChatDto
        id
        name # Changed from username
        email
        # avatar and status removed
      }
      # lastMessage removed
      # participants removed
      # messages field could be added here if needed, but likely fetched separately
    }
  }
`;

// Updated query name and fields based on ChatDto
export const GET_CHAT = gql`
  query GetChat($id: ID!) { # Changed from GetChatById
    getChat(id: $id) { # Changed from getChatById
      id
      name
      type
      user { # Added user field
        id
        name
        email
      }
      messages { # Added messages field
        id
        content
        createdAt
        sender {
          id
          name
          email
        }
      }
      # participants removed
    }
  }
`;

// Message queries
// Updated limit/offset types and sender fields
export const GET_MESSAGES = gql`
  query GetMessages($chatId: ID!, $limit: Float, $offset: Float) { # Changed limit/offset to Float
    getMessages(chatId: $chatId, limit: $limit, offset: $offset) {
      id
      content
      createdAt
      sender {
        id
        name # Changed from username
        email # Added email for consistency
        # avatar removed
      }
    }
  }
`;

// Call History Query
export const GET_CALL_HISTORY = gql`
  query GetCallHistory($userId: ID!) { # Assuming filtering by userId on backend
    getCallHistory(userId: $userId) {
      id
      callerId
      calleeId
      chatId
      status
      createdAt
      updatedAt
      # Include related data if needed and available in CallDto/backend
      # caller { id name email }
      # callee { id name email }
      # chat { id name }
    }
  }
`;

// File Query
export const GET_FILES = gql`
  query GetFiles { # Assuming backend gets userId from context
    getFiles {
      id
      name
      url
      size
      type
      createdAt
      uploader {
        id
        name
        email
      }
    }
  }
`;