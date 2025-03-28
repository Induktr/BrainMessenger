import { gql } from '@apollo/client';

// No subscriptions are currently defined in the backend schema.
// Add subscriptions here when they are implemented in the backend.

// Example (needs backend implementation):
// export const MESSAGE_ADDED = gql`
//   subscription MessageAdded($chatId: ID!) {
//     messageAdded(chatId: $chatId) {
//       id
//       content
//       createdAt
//       sender {
//         id
//         name
//         email
//       }
//       # chatId is implicitly known or can be added if needed
//     }
//   }
// `;