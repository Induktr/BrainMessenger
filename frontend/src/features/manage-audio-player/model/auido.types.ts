export interface AudioPlayerProps {
    src: string;
    messageId: string; // Pass messageId to identify which audio is being played
}

export interface GlobalAudioContextType {
    currentAudioSrc: string | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isLooping: boolean;
    showGlobalControls: boolean;
    playAudio: (src: string) => void;
    pauseAudio: () => void;
    seekAudio: (time: number) => void;
    setVolume: (volume: number) => void;
    toggleLoop: () => void;
}