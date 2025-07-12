import { gql } from '@apollo/client';

export const BAN_USER_MUTATION = gql`
  mutation BanUser($userId: String!, $reason: String!, $durationDays: Int!) {
    banUser(userId: $userId, reason: $reason, durationDays: $durationDays)
  }
`;

export const DELETE_COMPLAINT_MESSAGE_MUTATION = gql`
  mutation DeleteComplaintMessage($messageId: String!) {
    deleteComplaintMessage(messageId: $messageId)
  }
`;