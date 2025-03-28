import { gql } from '@apollo/client';

// Auth mutations
// Updated returned fields based on LoginResponseDto
export const REGISTER = gql`
  mutation Register($registerInput: RegisterInput!) { # Argument name matches schema
    register(registerInput: $registerInput) { # Argument name matches schema
      access_token # Changed from token
      user {
        id
        name # Changed from username
        email
      }
    }
  }
`;

// Updated returned fields based on LoginResponseDto
export const LOGIN = gql`
  mutation Login($loginInput: LoginInput!) { # Argument name matches schema
    login(loginInput: $loginInput) { # Argument name matches schema
      access_token # Changed from token
      user {
        id
        name # Changed from username
        email
      }
    }
  }
`;

// REFRESH_TOKEN mutation removed as it's not in the backend schema

// Chat mutations
// Updated arguments and returned fields based on backend schema/ChatDto
export const CREATE_CHAT = gql`
  mutation CreateChat($userId: ID!) { # Changed argument from input to userId
    createChat(userId: $userId) { # Changed argument from input to userId
      id
      name
      type
      user { # Changed from participants
        id
        name # Changed from username
        email
      }
    }
  }
`;

// ADD_USER_TO_CHAT mutation removed as it's not in the backend schema

// Message mutations
// Updated arguments and returned fields based on backend schema/MessageDto
export const SEND_MESSAGE = gql`
  mutation SendMessage($chatId: ID!, $content: String!, $senderId: ID!) { # Changed from input object
    sendMessage(chatId: $chatId, content: $content, senderId: $senderId) { # Changed from input object
      id
      content
      createdAt
      sender {
        id
        name # Changed from username
        email
      }
      # chat { id } removed, chatId is available directly if needed
    }
  }
`;

// User profile mutations
// Updated mutation name, arguments, and returned fields
export const UPDATE_USER = gql` # Renamed from UPDATE_PROFILE
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) { # Changed arguments
    updateUser(id: $id, input: $input) { # Changed mutation name and arguments
      id
      name # Changed from username
      email
      # avatar removed
    }
  }
`;

// UPDATE_SECURITY_SETTINGS mutation removed as it's not in the backend schema

// Call mutations (based on backend schema)
export const INITIATE_CALL = gql`
  mutation InitiateCall($calleeId: ID!, $chatId: ID!) {
    initiateCall(calleeId: $calleeId, chatId: $chatId) {
      id
      callerId
      calleeId
      chatId
      status
      # Add createdAt, updatedAt if needed from CallDto
    }
  }
`;

export const ACCEPT_CALL = gql`
  mutation AcceptCall($callId: ID!) {
    acceptCall(callId: $callId) {
      id
      status
      # Add other fields from CallDto if needed
    }
  }
`;

export const END_CALL = gql`
  mutation EndCall($callId: ID!) {
    endCall(callId: $callId) # Returns Boolean
  }
`;

// File mutations
export const UPLOAD_FILE = gql`
  mutation UploadFile($file: Upload!) { # Use Upload scalar type
    uploadFile(file: $file) { # Argument name matches resolver
      id
      name
      url
      size
      type
      createdAt
      uploader {
        id
        name
      }
    }
  }
`;

export const DELETE_FILE = gql`
  mutation DeleteFile($fileId: ID!) {
    deleteFile(fileId: $fileId) # Returns Boolean
  }
`;