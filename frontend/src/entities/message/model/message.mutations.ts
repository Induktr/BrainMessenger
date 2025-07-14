import { gql } from '@apollo/client';

export const ADD_MESSAGE_REACTION = gql`
  mutation AddMessageReaction($messageId: ID!, $emoji: String!) {
    addMessageReaction(messageId: $messageId, emoji: $emoji) {
      id
      reactions {
        id
        userId
        emoji
      }
    }
  }
`;

export const REMOVE_MESSAGE_REACTION = gql`
  mutation RemoveMessageReaction($messageId: ID!, $emoji: String!) {
    removeMessageReaction(messageId: $messageId, emoji: $emoji) {
      id
      reactions {
        id
        userId
        emoji
      }
    }
  }
`;

export const SET_USER_TYPING = gql`
  mutation SetUserTyping($chatId: ID!, $isTyping: Boolean!) {
    setUserTyping(chatId: $chatId, isTyping: $isTyping)
  }
`;

export const DELETE_MESSAGE = gql`
  mutation DeleteMessage($messageId: ID!) {
    deleteMessage(messageId: $messageId)
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
        status
        bio
        role
      }
      attachments {
        id
        url
        filename
        mimetype
        size
        createdAt
      }
      deletedForUserIds
      reactions {
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
      chatId
      content
      createdAt
      sender {
        id
        name
        avatarUrl
        username
        status
        bio
        role
      }
      attachments {
        id
        url
        filename
        mimetype
        size
        createdAt
      }
      deletedForUserIds
      reactions {
        id
        userId
        emoji
      }
    }
  }
`;