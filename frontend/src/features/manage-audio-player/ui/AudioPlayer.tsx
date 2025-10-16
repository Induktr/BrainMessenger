'use client';

import { 
  Play, 
  Pause 
} from '@/shared/assets/Icons/icons';
import { 
  useGlobalAudio 
} from '@/app/providers/GlobalAudioProvider/GlobalAudioContext'; // Import useGlobalAudio
import { 
  AudioPlayerProps 
} from '@/features/manage-audio-player/model/auido.types';

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, messageId }) => {
  const { currentAudioSrc, isPlaying: isGlobalPlaying, currentTime: globalCurrentTime, duration: globalDuration, playAudio, pauseAudio, seekAudio } = useGlobalAudio(); // Consume global audio context

  const isThisAudioPlayingGlobally = currentAudioSrc === src;

  // Duration and current time should always come from the global context
  const displayDuration = globalDuration;
  const displayCurrentTime = globalCurrentTime;


  const handlePlayButtonClick = () => {
    if (isThisAudioPlayingGlobally && isGlobalPlaying) {
      pauseAudio();
    } else {
      playAudio(src);
    }
  };

  const progress = isThisAudioPlayingGlobally && displayDuration > 0 ? (displayCurrentTime / displayDuration) * 100 : 0;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="flex items-center w-full gap-2 p-2 rounded-lg bg-surface">
      <button
        onClick={handlePlayButtonClick}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-accent)] text-white transition-transform hover:scale-110"
      >
        {isThisAudioPlayingGlobally && isGlobalPlaying ? (
          <Pause alt="Pause" width={16} height={16} />
        ) : (
          <Play alt="Play" width={16} height={16} />
        )}
      </button>
      <input
        type="range"
        min="0"
        max={displayDuration || 0}
        value={isThisAudioPlayingGlobally ? displayCurrentTime || 0 : 0}
        onChange={(e) => seekAudio(parseFloat(e.target.value))}
        className="w-full h-1 bg-transparent rounded-lg appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, var(--color-gradient-start) ${progress}%, var(--color-disabled) ${progress}%)`
        }}
        disabled={!isThisAudioPlayingGlobally}
      />
      <div className="text-xs font-mono text-[var(--color-text-secondary)] w-20 text-center">
        {isThisAudioPlayingGlobally ? formatTime(displayCurrentTime) : formatTime(0)} / {formatTime(displayDuration)}
      </div>
    </div>
  );
};

export default AudioPlayer;