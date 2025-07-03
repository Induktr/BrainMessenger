import { gql } from '@apollo/client';

export const GET_MESSAGES = gql`
  query GetMessages($chatId: ID!) {
    getMessages(chatId: $chatId) {
      id
      content
      createdAt
      sender {
        id
        name
        avatarUrl # Add avatarUrl
        username # Add username
        bio # Add bio
      }
      attachments { # Add attachments field
        id
        url
        filename
        mimetype
      }
      reactions { # Include reactions
        id
        userId
        emoji
      }
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($chatId: ID!, $content: String!, $files: [Upload!]) {
    sendMessage(chatId: $chatId, content: $content, files: $files) {
      id
      content
      createdAt
      sender {
        id
        name
        avatarUrl
        username
        bio
      }
      # Add fields for attached files if they are returned by the backend
      # For example:
      # attachments {
      #   id
      #   url
      #   filename
      #   mimetype
      # }
    }
  }
`;

export const DELETE_MESSAGE = gql`
  mutation DeleteMessage($messageId: ID!) {
    deleteMessage(messageId: $messageId)
  }
`;

export const DELETE_MESSAGES = gql`
  mutation DeleteMessages($messageIds: [ID!]!) {
    deleteMessages(messageIds: $messageIds)
  }
`;

export const UPDATE_MESSAGE = gql`
  mutation UpdateMessage($messageId: ID!, $content: String!) {
    updateMessage(messageId: $messageId, content: $content) {
      id
      content
      createdAt
      sender {
        id
        name
        avatarUrl
        username
        bio
      }
    }
  }
`;

export const SET_USER_TYPING = gql`
  mutation SetUserTyping($chatId: ID!, $isTyping: Boolean!) {
    setUserTyping(chatId: $chatId, isTyping: $isTyping)
  }
`;