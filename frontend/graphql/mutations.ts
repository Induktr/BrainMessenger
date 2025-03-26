import { gql } from '@apollo/client';

// Auth mutations
export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      id
      username
      email
      token
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      id
      username
      email
      token
    }
  }
`;

export const REFRESH_TOKEN = gql`
  mutation RefreshToken {
    refreshToken {
      token
    }
  }
`;

// Chat mutations
export const CREATE_CHAT = gql`
  mutation CreateChat($input: CreateChatInput!) {
    createChat(input: $input) {
      id
      name
      type
      participants {
        id
        username
      }
    }
  }
`;

export const ADD_USER_TO_CHAT = gql`
  mutation AddUserToChat($chatId: ID!, $userId: ID!) {
    addUserToChat(chatId: $chatId, userId: $userId) {
      id
      name
      participants {
        id
        username
      }
    }
  }
`;

// Message mutations
export const SEND_MESSAGE = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      id
      content
      createdAt
      sender {
        id
        username
      }
      chat {
        id
      }
    }
  }
`;

// User profile mutations
export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      username
      email
      avatar
    }
  }
`;

// Security settings mutations
export const UPDATE_SECURITY_SETTINGS = gql`
  mutation UpdateSecuritySettings($input: SecuritySettingsInput!) {
    updateSecuritySettings(input: $input) {
      success
      message
    }
  }
`;