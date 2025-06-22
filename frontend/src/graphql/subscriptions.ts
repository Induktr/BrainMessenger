import { gql } from '@apollo/client';

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