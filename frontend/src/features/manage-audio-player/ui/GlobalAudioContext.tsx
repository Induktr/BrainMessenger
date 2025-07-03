import React, { createContext, useContext, useRef, useState, useEffect, ReactNode } from 'react';
import { GlobalAudioContextType } from '@/features/manage-audio-player/model/auido.types';

const GlobalAudioContext = createContext<GlobalAudioContextType | undefined>(undefined);

export const GlobalAudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentAudioSrc, setCurrentAudioSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1); // Volume state (0 to 1)
  const [isLooping, setIsLooping] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (audio) setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (audio) setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      // Optionally add logic to play next audio in a playlist if needed later
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', () => setIsPlaying(false)); // Add listener for pause event

    return () => {
      if (audio) {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('pause', () => setIsPlaying(false)); // Clean up pause listener
        audio.pause();
        audioRef.current = null; // Clean up ref
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
    }
  }, [isLooping]);

  const playAudio = (src: string) => {
    if (audioRef.current) {
      if (audioRef.current.src !== src) {
        audioRef.current.src = src;
        setCurrentAudioSrc(src);
        setCurrentTime(0); // Reset time for new audio
      }
      // Set isPlaying to true only after the play promise resolves successfully
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(e => console.error("Error playing audio:", e));
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const seekAudio = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setVolume = (volume: number) => {
    setVolumeState(volume);
  };

  const toggleLoop = () => {
    setIsLooping(prev => !prev);
  };

  return (
    <GlobalAudioContext.Provider value={{
      currentAudioSrc,
      isPlaying,
      currentTime,
      duration,
      volume,
      isLooping,
      playAudio,
      pauseAudio,
      seekAudio,
      setVolume,
      toggleLoop,
    }}>
      {children}
    </GlobalAudioContext.Provider>
  );
};

export const useGlobalAudio = () => {
  const context = useContext(GlobalAudioContext);
  if (context === undefined) {
    throw new Error('useGlobalAudio must be used within a GlobalAudioProvider');
  }
  return context;
};