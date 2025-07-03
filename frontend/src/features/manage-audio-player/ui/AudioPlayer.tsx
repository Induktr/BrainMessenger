'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ICONS } from '@/shared/assets/Icons/icons';
import { useGlobalAudio } from '@/features/manage-audio-player/ui/GlobalAudioContext'; // Import useGlobalAudio
import { AudioPlayerProps } from '@/features/manage-audio-player/model/auido.types';

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, messageId, onShowGlobalControls }) => {
  const { currentAudioSrc, isPlaying: isGlobalPlaying, currentTime: globalCurrentTime, duration: globalDuration, playAudio, pauseAudio, seekAudio } = useGlobalAudio(); // Consume global audio context

  const isThisAudioPlayingGlobally = currentAudioSrc === src;

  // Local state is no longer needed as playback is managed globally
  // const [localDuration, setLocalDuration] = useState(0);
  // const audioRef = useRef<HTMLAudioElement>(null); // Local ref removed

  // Duration and current time should always come from the global context
  const displayDuration = globalDuration;
  const displayCurrentTime = globalCurrentTime;


  const handlePlayButtonClick = () => {
    // If this audio is already playing globally and is currently playing, pause it.
    // Otherwise, play this audio globally.
    if (isThisAudioPlayingGlobally && isGlobalPlaying) {
      pauseAudio(); // Use pauseAudio from global context
    } else {
      playAudio(src); // Trigger global playback using playAudio from global context
      onShowGlobalControls(messageId, src); // Signal to show global controls
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="audio-player-container">
      {/* Local audio element removed - playback is handled by GlobalAudioContext */}
      {/* Blue button to trigger global playback */}
      <button onClick={handlePlayButtonClick} className="audio-player-play-pause-button">
        {/* Use global state to determine play/pause icon */}
        <Image src={isThisAudioPlayingGlobally && isGlobalPlaying ? ICONS.play : ICONS.pause} alt={isThisAudioPlayingGlobally && isGlobalPlaying ? "Pause" : "Play"} width={20} height={20} className="audio-player-icon" style={{ objectFit: 'contain' }} />
      </button>
      {/* Display global progress if this audio is playing globally, otherwise display 0 progress */}
      <input
        type="range"
        min="0"
        max={displayDuration || 0} // Ensure max is at least 0
        value={isThisAudioPlayingGlobally ? (displayCurrentTime || 0) : 0} // Ensure value is at least 0, only show progress if playing globally
        onChange={(e) => seekAudio(parseFloat(e.target.value))} // Use global seek
        className="audio-player-progress-slider"
        style={{
          background: `linear-gradient(to right, #96C93D 0%, #96C93D ${isThisAudioPlayingGlobally && displayDuration > 0 ? ((displayCurrentTime || 0) / displayDuration) * 100 : 0}%, #4D4D4D ${isThisAudioPlayingGlobally && displayDuration > 0 ? ((displayCurrentTime || 0) / displayDuration) * 100 : 0}%, #4D4D4D 100%)`
        }}
        disabled={!isThisAudioPlayingGlobally} // Disable seeking if not playing globally
      />
      <div className="audio-player-time-display">
        {/* Display global time if playing globally, otherwise display 0:00 / duration */}
        {isThisAudioPlayingGlobally ? formatTime(displayCurrentTime) : formatTime(0)} / {formatTime(displayDuration)}
      </div>
    </div>
  );
};

export default AudioPlayer;