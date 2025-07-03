export interface ChatInputProps {
    chatId: string;
    editingMessage: { id: string; content: string } | null;
    setEditingMessage: (message: { id: string; content: string } | null) => void;
    onSendMessageOrUpdate: (content: string, files: File[]) => Promise<void>;
    isChannel: boolean; // New prop: true if the current chat is a channel
    isChannelOwner: boolean; // New prop: true if the current user is the channel owner
    isSubscribedToChannel: boolean; // New prop: true if the current user is subscribed to the channel
    onSubscribe: () => Promise<void>; // New prop: function to handle subscription
    onUnsubscribe: () => Promise<void>; // New prop: function to handle unsubscription
}