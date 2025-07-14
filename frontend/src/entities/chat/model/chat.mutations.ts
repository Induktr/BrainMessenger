import { gql } from '@apollo/client';

export const CREATE_CHAT = gql`
  mutation CreateChat($createChatInput: CreateChatInput!) {
    createChat(createChatInput: $createChatInput) {
      id
      name
      type
      participants {
        id
        name
        avatarUrl
        username
        status
        bio
        role
      }
    }
  }
`;

export const FIND_OR_CREATE_PRIVATE_CHAT = gql`
  mutation FindOrCreatePrivateChat($otherUserId: ID!) {
    findOrCreatePrivateChat(otherUserId: $otherUserId) {
      id
      name
      type
      participants {
        id
        name
        avatarUrl
        username
        status
        bio
        role
      }
    }
  }
`;

export const DELETE_CHAT = gql`
  mutation DeleteChat($id: ID!) {
    deleteChat(id: $id)
  }
`;

export const DELETE_CHAT_HISTORY_FOR_USER = gql`
  mutation DeleteChatHistoryForUser($chatId: ID!) {
    deleteChatHistoryForUser(chatId: $chatId)
  }
`;

export const DELETE_CHAT_AND_REMOVE_USER = gql`
  mutation DeleteChatAndRemoveUser($chatId: ID!) {
    deleteChatAndRemoveUser(chatId: $chatId)
  }
`;