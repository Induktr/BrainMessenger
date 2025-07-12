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
        role
      }
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
        role
      }
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
      role
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

export const GET_USER_STATS = gql`
  query GetUserStats {
    getUserStats {
      totalUsers
      activeUsers
      newUsersToday
    }
  }
`;