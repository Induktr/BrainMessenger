import { gql } from '@apollo/client';

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