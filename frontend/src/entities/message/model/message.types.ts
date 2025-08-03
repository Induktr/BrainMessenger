export interface Message {
  id: string;
  chatId: string;
  sender: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    username?: string | null;
    status?: string;
    bio?: string | null;
  };
  content: string;
  createdAt: string;
  attachments?: {
    id: string;
    url: string;
    filename: string;
    mimetype: string;
  }[];
}

export interface TypingUser {
  id: string;
  name: string;
}

export interface ChatMessageProps {
  message: {
    id: string;
    sender: {
      id: string;
      name: string;
      avatarUrl?: string | null; // Add avatarUrl
      username?: string | null; // Add username
      status?: string; // Add status
      bio?: string | null; // Add bio
    };
    content: string;
    createdAt: string; // Changed from timestamp to createdAt
    attachments?: { // Add attachments field
      id: string;
      url: string;
      filename: string;
      mimetype: string;
    }[];
    reactions?: { // Add reactions field
      id: string;
      userId: string;
      emoji: string;
    }[];
  };
  isCurrentUser: boolean;
  onEditMessage: (message: { id: string; content: string }) => void; // New prop for editing
  onAudioEnded: (messageId: string, attachmentIndex: number) => void;
  currentlyPlayingAudio: { messageId: string; attachmentIndex: number } | null;
  setCurrentlyPlayingAudio: React.Dispatch<React.SetStateAction<{ messageId: string; attachmentIndex: number } | null>>;
  isSelected: boolean; // New prop for selection state
  isSelecting: boolean; // New prop to indicate if selection is active
  isPoorConnection: boolean; // New prop for network status
  isRecentMessage: boolean; // New prop to indicate if it's one of the last 10 messages
  currentUserId?: string | null; // Add currentUserId prop
  onImageClick?: (imageUrl: string) => void; // Prop to handle image click for gallery
}