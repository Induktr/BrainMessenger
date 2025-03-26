import { gql } from '@apollo/client';

// User queries
export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    getCurrentUser {
      id
      username
      email
      avatar
      status
    }
  }
`;

export const GET_USER_BY_ID = gql`
  query GetUserById($id: ID!) {
    getUserById(id: $id) {
      id
      username
      email
      avatar
      status
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
      lastMessage {
        id
        content
        createdAt
        sender {
          id
          username
        }
      }
      participants {
        id
        username
        avatar
        status
      }
    }
  }
`;

export const GET_CHAT_BY_ID = gql`
  query GetChatById($id: ID!) {
    getChatById(id: $id) {
      id
      name
      type
      participants {
        id
        username
        avatar
        status
      }
    }
  }
`;

// Message queries
export const GET_MESSAGES = gql`
  query GetMessages($chatId: ID!, $limit: Int, $offset: Int) {
    getMessages(chatId: $chatId, limit: $limit, offset: $offset) {
      id
      content
      createdAt
      sender {
        id
        username
        avatar
      }
    }
  }
`;