export const playNotificationSound = () => {
  try {
    const audio = new Audio('/sound/notification.mp3');
    audio.play().catch(e => console.error("Error playing notification sound:", e));
  } catch (e) {
    console.error("Failed to create Audio object or play sound:", e);
  }
};