'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { icons } from '@/app/lib/constants';

interface AudioPlayerProps {
  src: string;
  onEndedCallback?: () => void;
  shouldPlay: boolean;
  onOpenOptions: (messageId: string, src: string, currentTime: number, duration: number, isPlaying: boolean, isLooping: boolean) => void; // Pass all relevant states
  messageId: string; // Pass messageId to identify which audio is being played
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, onEndedCallback, shouldPlay, onOpenOptions, messageId }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false); // Keep local loop state

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping; // Set loop property
      if (shouldPlay && !isPlaying) {
        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
        setIsPlaying(true);
      } else if (!shouldPlay && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [shouldPlay, isLooping, isPlaying]); // Add isPlaying to dependencies

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (onEndedCallback) {
      onEndedCallback();
    }
  }, [onEndedCallback]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const seekTime = parseFloat(e.target.value);
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [handleTimeUpdate, handleLoadedMetadata, handleEnded]);

  return (
    <div className="audio-player-container">
      <audio ref={audioRef} src={src} preload="metadata" />
      <button onClick={togglePlayPause} className="audio-player-play-pause-button">
        <img src={isPlaying ? icons.play : icons.pause} alt={isPlaying ? icons.play : icons.pause} width={20} height={20} className="audio-player-icon" style={{ objectFit: 'contain' }} />
      </button>
      <input
        type="range"
        min="0"
        max={duration}
        value={currentTime}
        onChange={handleSeek}
        className="audio-player-progress-slider"
        style={{
          background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(currentTime / duration) * 100}%, #4B5563 ${(currentTime / duration) * 100}%, #4B5563 100%)`
        }}
      />
      <div className="audio-player-time-display">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>
      {/* Options button to open global audio controls */}
      <button onClick={() => onOpenOptions(messageId, src, currentTime, duration, isPlaying, isLooping)} className="audio-player-options-button">
        <Image src={icons.options} alt="Options" width={20} height={20} className="audio-player-icon" />
      </button>
    </div>
  );
};
 
export default AudioPlayer;