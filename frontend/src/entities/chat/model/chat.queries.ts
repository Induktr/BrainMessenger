import { gql } from '@apollo/client';

export const GET_CHAT_DETAILS = gql`
  query GetChatDetails($chatId: ID!) {
    chat(id: $chatId) {
      id
      name
      avatarUrl
      participants {
        id
        name
        avatarUrl
        isOnline
        lastSeen
      }
    }
  }
`;

export const GLOBAL_SEARCH_QUERY = gql`
  query GlobalSearch($query: String!) {
    globalSearch(query: $query) {
      users {
        id
        name
        username
        avatarUrl
      }
      chats {
        id
        name
        type
        participants {
          id
          name
          avatarUrl
        }
        channel {
          id
          name
          description
          subscribersCount
        }
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
        name
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