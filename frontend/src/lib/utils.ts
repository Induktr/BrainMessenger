/**
 * Generates a consistent Tailwind CSS background color class based on a seed string.
 * Uses a simple hashing function to pick from a predefined list of colors.
 * @param seed - The string to base the color generation on (e.g., username, ID).
 * @returns A Tailwind CSS background color class string (e.g., 'bg-red-500').
 */
export const generateConsistentColor = (seed: string): string => {
  const colors = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
    'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
    'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
    'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500',
    'bg-rose-500',
  ];

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

/**
 * Gets the first letter of a name string, capitalized.
 * Returns '?' if the name is empty or null.
 * @param name - The name string.
 * @returns The capitalized first letter or '?'.
 */
export const getInitials = (name?: string | null): string => {
  if (!name || name.trim().length === 0) {
    return '?';
  }
  return name.trim()[0].toUpperCase();
};