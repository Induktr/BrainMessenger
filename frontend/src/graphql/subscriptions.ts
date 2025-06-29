import { gql } from '@apollo/client';

export const TYPING_STATUS_SUBSCRIPTION = gql`
  subscription TypingStatus($chatId: ID!) {
    typingStatus(chatId: $chatId) {
      user {
        id
        name
      }
      isTyping
    }
  }
`;

export const MESSAGE_ADDED_SUBSCRIPTION = gql`
  subscription MessageAdded($chatId: ID!) {
    messageAdded(chatId: $chatId) {
      id
      content
      createdAt
      sender {
        id
        name
        avatarUrl
      }
      attachments {
        id
        url
        filename
        mimetype
      }
    }
  }
`;

export const MESSAGE_UPDATED_SUBSCRIPTION = gql`
  subscription MessageUpdated($chatId: ID!) {
    messageUpdated(chatId: $chatId) {
      id
      content
    }
  }
`;

export const MESSAGE_DELETED_SUBSCRIPTION = gql`
  subscription MessageDeleted($chatId: ID!) {
    messageDeleted(chatId: $chatId)
  }
`;

export const NEW_MESSAGE_SUBSCRIPTION = gql`
  subscription NewMessage($chatId: ID!) {
    newMessage(chatId: $chatId) {
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
        roles
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

export const MESSAGE_REACTION_ADDED_OR_REMOVED_SUBSCRIPTION = gql`
  subscription MessageReactionAddedOrRemoved($chatId: ID!) {
    messageReactionAddedOrRemoved(chatId: $chatId) {
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
        roles
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