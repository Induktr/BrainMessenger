import { gql } from '@apollo/client';

export const GET_FEEDBACK_COMPLAINTS = gql`
  query GetFeedbackComplaints {
    feedbackComplaints {
      id
      content
      status
      createdAt
      user {
        id
        name
      }
      message {
        id
        content
      }
    }
  }
`;
