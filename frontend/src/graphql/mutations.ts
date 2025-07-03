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

export const UPLOAD_FILE = gql`
  mutation UploadFile($file: Upload!) {
    uploadFile(file: $file) {
      id
      name
      url
      size
      type
      uploader {
        id
        name
        avatarUrl
        username
        status
        bio
        roles
      }
      createdAt
    }
  }
`;

export const DELETE_FILE = gql`
  mutation DeleteFile($fileId: ID!) {
    deleteFile(fileId: $fileId)
  }
`;

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
        roles
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
        roles
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

export const CREATE_CHANNEL = gql`
  mutation CreateChannel($createChannelInput: CreateChannelInput!) {
    createChannel(createChannelInput: $createChannelInput) {
      id
      name
      type
      channel {
        id
        description
        isPublic
        owner {
          id
          name
          avatarUrl
          username
          status
          bio
          roles
        }
      }
      participants {
        id
        name
        avatarUrl
        username
        status
        bio
        roles
      }
    }
  }
`;

export const SUBSCRIBE_TO_CHANNEL = gql`
  mutation SubscribeToChannel($channelId: ID!) {
    subscribeToChannel(channelId: $channelId)
  }
`;

export const UNSUBSCRIBE_FROM_CHANNEL = gql`
  mutation UnsubscribeFromChannel($channelId: ID!) {
    unsubscribeFromChannel(channelId: $channelId)
  }
`;

export const DELETE_CHANNEL = gql`
  mutation DeleteChannel($channelId: ID!) {
    deleteChannel(channelId: $channelId)
  }
`;

export const UPDATE_CHANNEL_PRIVACY = gql`
  mutation UpdateChannelPrivacy($channelId: ID!, $isPublic: Boolean!) {
    updateChannelPrivacy(channelId: $channelId, isPublic: $isPublic) {
      id
      description
      isPublic
    }
  }
`;