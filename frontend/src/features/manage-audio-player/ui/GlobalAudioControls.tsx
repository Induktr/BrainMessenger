'use client';

import React, { 
  useState, 
  useEffect, 
  useRef 
} from 'react';
import { 
  useGlobalAudio 
} from '@/app/providers/GlobalAudioProvider/GlobalAudioContext';
import { 
  Play, 
  Pause, 
  Loop, 
  OnSound, 
  OffSound 
} from '@/shared/assets/Icons/icons';
import { variantsStylesIcons } from '@/shared/assets/VariantStyles/variantStyles';

const GlobalAudioControls: React.FC = () => {
  const {
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
  } = useGlobalAudio();

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const volumeControlRef = useRef<HTMLDivElement>(null); // Ref for the volume control container

  const handleVolumeIconClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent this click from immediately closing the slider via the document listener
    setShowVolumeSlider(prev => !prev); // Toggle visibility
  };

  // Effect to handle clicks outside the volume control to close the slider
  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      // Check if the click target is outside the volume control container
      if (volumeControlRef.current && !volumeControlRef.current.contains(event.target as Node)) {
        setShowVolumeSlider(false);
      }
    };

    // Add the event listener when the slider is shown
    if (showVolumeSlider) {
      document.addEventListener('mousedown', handleDocumentClick);
    }

    // Clean up the event listener
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, [showVolumeSlider]); // Re-run effect when showVolumeSlider changes

  const handleVolumeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!currentAudioSrc) {
    return null; // Don't render if no audio is currently active globally
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full bg-[var(--color-surface)] p-3 border-b border-[var(--color-border)] shadow-md">
      <div className="flex items-center gap-4 max-w-4xl mx-auto">
        <button
          onClick={isPlaying ? pauseAudio : () => playAudio(currentAudioSrc!)}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-accent)] text-white transition-transform hover:scale-105"
        >
          {isPlaying ? <Pause width={20} height={20} /> : <Play width={20} height={20} />}
        </button>
        
        <div className="text-sm font-mono text-[var(--color-text-secondary)] w-14 text-center">
          {formatTime(currentTime)}
        </div>

        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={(e) => seekAudio(parseFloat(e.target.value))}
          className="w-full h-1 bg-transparent rounded-lg appearance-none cursor-pointer"
          style={{ background: `linear-gradient(to right, var(--color-gradient-start) ${progress}%, var(--color-disabled) ${progress}%)` }}
        />

        <div className="text-sm font-mono text-[var(--color-text-secondary)] w-14 text-center">
          {formatTime(duration)}
        </div>

        <button
          onClick={toggleLoop}
          className={`p-2 rounded-full transition-colors ${isLooping ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/10' : `${variantsStylesIcons.iconAccent} hover:bg-black/10`}`}
        >
          <Loop className={variantsStylesIcons.iconAccent} />
        </button>

        <div className="relative flex items-center" ref={volumeControlRef}>
          <button
            onClick={handleVolumeIconClick}
            className="p-2 rounded-full text-[var(--color-text-secondary)] hover:bg-black/10 transition-colors"
          >
            {volume > 0 ? <OnSound /> : <OffSound />}
          </button>
          {showVolumeSlider && (
            <div className="absolute bottom-full mb-2 p-2 bg-[var(--color-surface-dark)] rounded-lg shadow-lg">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeSliderChange}
                className="w-24 h-1 bg-transparent rounded-lg appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, var(--color-success) ${volume * 100}%, var(--color-disabled) ${volume * 100}%)` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalAudioControls;