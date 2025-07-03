import { gql } from '@apollo/client';

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      access_token
      refresh_token
      user {
        id
        email
        name
        isVerified
        avatarUrl
        username
        bio
      }
    }
  }
`;

export const GET_CHATS = gql`
  query GetChats {
    getChats {
      id
      name
      type
      lastMessageSnippet
      lastMessageTimestamp
      unreadCount
      participants { # Add participants field
        id
        name
        username
        avatarUrl
        isVerified # Include isVerified
        bio
      }
      channel { # Include channel details if it's a channel
        id
        description
        subscribersCount
        isPublic
        owner {
          id
          name
          username
          avatarUrl
          isVerified
          bio
        }
      }
    }
  }
`;

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


export const REGISTER_USER = gql`
  mutation RegisterUser($email: String!, $password: String!, $name: String!, $username: String) {
    register(registerInput: { email: $email, password: $password, name: $name, username: $username }) {
      id
      email
      name
      username
      isVerified
      avatarUrl
      bio
    }
  }
`;

export const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    login(loginInput: { email: $email, password: $password }) {
      access_token
      refresh_token
      user {
        id
        email
        name
        isVerified
        avatarUrl
        username
        bio
      }
    }
  }
`;

export const CREATE_CHAT = gql`
  mutation CreateChat($type: String!, $name: String, $participantIds: [ID!]!) {
    createChat(createChatInput: { type: $type, name: $name, participantIds: $participantIds }) {
      id
      name
      type
      lastMessageSnippet
      lastMessageTimestamp
      unreadCount
      participants {
        id
        name
        username
        avatarUrl
        isVerified
        bio
      }
    }
  }
`;

export const CREATE_CHANNEL = gql`
  mutation CreateChannel($name: String!, $description: String) {
    createChannel(createChannelInput: { name: $name, description: $description }) {
      id
      name
      type
      lastMessageSnippet
      lastMessageTimestamp
      unreadCount
      participants {
        id
        name
        username
        avatarUrl
        isVerified
        bio
      }
      channel {
        id
        description
        subscribersCount
        isPublic
        owner {
          id
          name
          username
          avatarUrl
          isVerified
          bio
        }
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
      isPublic
    }
  }
`;

 
export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    getCurrentUser {
      id
      email
      name
      isVerified
      avatarUrl
      bio # Add bio field
      username
    }
  }
`;
 
export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      email
      name
      isVerified
      avatarUrl
      bio
      username
    }
  }
`;

export const SEND_VERIFICATION_EMAIL = gql`
  mutation SendVerificationEmail($email: String!) {
    resendVerificationCode(email: $email)
  }
`;

export const UPDATE_LAST_ACTIVE_MUTATION = gql`
  mutation UpdateLastActive {
    updateLastActive {
      id
    }
  }
`;

export const VERIFY_EMAIL = gql`
  mutation VerifyEmail($code: String!) {
    verifyEmail(code: $code) {
      id
      email
      name
      isVerified
      avatarUrl
      username
      bio
    }
  }
`;

export const UPDATE_LAST_ACTIVE = gql`
  mutation UpdateLastActive {
    updateLastActive {
      id
      email
      name
      isVerified
      avatarUrl
      bio
      username
    }
  }
`;
 
export const UPLOAD_AVATAR = gql`
  mutation UploadAvatar($file: Upload!) {
    uploadAvatar(file: $file) {
      id
      email
      name
      isVerified
      avatarUrl
      username
      bio
    }
  }
`;

export const FIND_OR_CREATE_PRIVATE_CHAT = gql`
  mutation FindOrCreatePrivateChat($otherUserId: ID!) {
    findOrCreatePrivateChat(otherUserId: $otherUserId) {
      id
      name
      type
      lastMessageSnippet
      lastMessageTimestamp
      unreadCount
      # Include participants if needed on the frontend after creating/finding a chat
      # participants {
      #   id
      #   email
      #   name
      #   username
      #   isVerified
      #   avatarUrl
      #   bio
      # }
    }
  }
`;

export const DELETE_MESSAGE = gql`
  mutation DeleteMessage($messageId: ID!) {
    deleteMessage(messageId: $messageId)
  }
`;

export const SEARCH_CHANNELS = gql`
  query SearchChannels($name: String!) {
    searchChannels(name: $name) {
      id
      name
      type
      lastMessageSnippet
      lastMessageTimestamp
      unreadCount
      participants {
        id
        name
        username
        avatarUrl
        isVerified
        bio
      }
      channel {
        id
        description
        subscribersCount
        isPublic
        owner {
          id
          name
          username
          avatarUrl
          isVerified
          bio
        }
      }
    }
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
 
// Add other queries and mutations later

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

export const SEARCH_USERS_BY_USERNAME = gql`
  query SearchUsersByUsername($username: String!) {
    searchUsersByUsername(username: $username) {
      id
      email
      name
      isVerified
      avatarUrl
      bio
      username
    }
  }
`;

export const GET_USER_BY_ID = gql`
  query GetUserById($id: ID!) {
    getUser(id: $id) {
      id
      email
      name
      isVerified
      avatarUrl
      bio
      username
    }
  }
`;
