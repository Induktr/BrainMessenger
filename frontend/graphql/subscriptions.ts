import { gql } from '@apollo/client';

// Message subscriptions
export const MESSAGE_ADDED = gql`
  subscription MessageAdded($chatId: ID!) {
    messageAdded(chatId: $chatId) {
      id
      content
      createdAt
      sender {
        id
        username
        avatar
      }
      chat {
        id
      }
    }
  }
`;

// Chat subscriptions
export const CHAT_UPDATED = gql`
  subscription ChatUpdated($chatId: ID!) {
    chatUpdated(chatId: $chatId) {
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

// User status subscriptions
export const USER_STATUS_CHANGED = gql`
  subscription UserStatusChanged {
    userStatusChanged {
      id
      username
      status
    }
  }
`;

// Call subscriptions
export const INCOMING_CALL = gql`
  subscription IncomingCall {
    incomingCall {
      id
      caller {
        id
        username
        avatar
      }
      type
      status
    }
  }
`;

export const CALL_STATUS_CHANGED = gql`
  subscription CallStatusChanged($callId: ID!) {
    callStatusChanged(callId: $callId) {
      id
      status
      participants {
        id
        username
      }
    }
  }
`;