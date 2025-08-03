import { listColors } from "@/shared/assets/Colors/colors";

// frontend/src/utils/avatarUtils.ts

// Define a set of colors that provide good contrast for text
// These should ideally be aligned with the project's color palette
const avatarColors = listColors;

/**
 * Generates data for a simple avatar placeholder.
 * @param name The name of the user.
 * @returns An object containing the first letter and a random background color.
 */
export const generateAvatarData = (name: string | null | undefined): { letter: string; color: string } => {
  const firstLetter = name ? name.charAt(0).toUpperCase() : '?';
  
  // Simple hash function to get a consistent color for a given name
  let hash = 0;
  if (name) {
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
  }
  
  const colorIndex = Math.abs(hash) % avatarColors.length;
  const color = avatarColors[colorIndex];

  return { letter: firstLetter, color };
};