'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useGlobalAudio } from '@/features/manage-audio-player/ui/GlobalAudioContext';
import { ICONS } from '@/shared/assets/Icons/icons';

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

  return (
    <div className="global-audio-options-panel">
      <div className="global-audio-controls">
        <button onClick={isPlaying ? pauseAudio : () => playAudio(currentAudioSrc)} className="audio-player-play-pause-button-dropdown">
          <Image src={isPlaying ? ICONS.pause : ICONS.play} alt={isPlaying ? "Pause" : "Play"} width={20} height={20} className="audio-player-icon" />
        </button>
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={(e) => seekAudio(parseFloat(e.target.value))}
          className="audio-player-progress-slider-dropdown"
          style={{
            background: `linear-gradient(to right, #96C93D 0%, #96C93D ${(currentTime / duration) * 100}%, #4D4D4D ${(currentTime / duration) * 100}%, #4D4D4D 100%)`
          }}
        />
        <div className="audio-player-time-display">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
        <button onClick={toggleLoop} className={`audio-player-loop-button ${isLooping ? 'active' : ''}`}>
          <Image src={ICONS.loop} alt="Loop" width={20} height={20} className="audio-player-icon-loop" />
        </button>
        <div
          className="audio-player-volume-control"
          ref={volumeControlRef} // Attach ref here
          onClick={handleVolumeIconClick} // Change to onClick
        >
          {volume > 0 ? (
            <Image src={ICONS.onSound} alt="On Volume" width={20} height={20} className="audio-player-icon-volume" />
            ) : (
            <Image src={ICONS.offSound} alt="Off Volume" width={20} height={20} className="audio-player-icon-volume" />
          )}

          {showVolumeSlider && (
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeSliderChange}
              className="audio-player-volume-slider"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalAudioControls;