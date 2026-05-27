// src/components/Player/Player.jsx
// The main bottom bar of the app
// Assembles Controls + ProgressBar + song info + volume
// This is where the actual Audio object lives and is controlled

import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'   // volume icons
import Controls from './Controls'
import ProgressBar from './ProgressBar'
import useMusicStore from '../../store/musicStore'  // global state

function Player() {

  // audioRef holds the actual HTML Audio object
  // useRef → persists between renders WITHOUT causing re-renders
  // Think of it as a direct handle to the audio engine
  const audioRef = useRef(null)

  // Local state — only Player needs these, no other component cares
  const [currentTime, setCurrentTime] = useState(0)   // seconds elapsed
  const [duration, setDuration] = useState(0)          // total length
  const [volume, setVolume] = useState(1)              // 0 to 1
  const [isMuted, setIsMuted] = useState(false)

  // Pull what we need from the global store
  const { 
    currentSong,    // the song object currently selected
    isPlaying,      // boolean
    isShuffled,     // boolean
    repeatMode,     // 'none' | 'all' | 'one'
    setIsPlaying,   // function to update isPlaying in store
    nextSong,       // function to move to next song
    previousSong,   // function to move to previous song
    toggleShuffle,  // function to toggle shuffle
    cycleRepeat,    // function to cycle repeat mode
    updateSongDuration,
  } = useMusicStore()


  // EFFECT 1 — when currentSong changes, load the new audio file
  useEffect(() => {
    if (!currentSong) return   // no song selected yet, do nothing

    const audio = audioRef.current

    // currentSong.fileUrl → the local file URL created from the File object
    audio.src = currentSong.fileUrl
    audio.load()    // tells the audio element to load the new source
    
    // Play automatically when a new song is loaded
    audio.play()
    setIsPlaying(true)

  }, [currentSong])   // runs every time currentSong changes


  // EFFECT 2 — when isPlaying changes, actually play or pause
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentSong) return

    if (isPlaying) {
      audio.play()
    } else {
      audio.pause()
    }
  }, [isPlaying])   // runs every time isPlaying changes


  // EFFECT 3 — when volume changes, update the audio element
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = isMuted ? 0 : volume
  }, [volume, isMuted])


  // Called every time the audio progresses
  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime)
  }

  // Called once when audio has loaded and knows its duration
  const handleLoadedMetadata = () => {
    const audioDuration = audioRef.current.duration
    setDuration(audioDuration)

    // update the song's duration in the store
    if (currentSong && audioDuration) {
      updateSongDuration(currentSong.id, audioDuration)
    }
  }

  // Called when audio naturally reaches the end
  const handleEnded = () => {
    if (repeatMode === 'one') {
      audioRef.current.currentTime = 0
      audioRef.current.play()
    } else {
      nextSong()
    }
  }

  // Called when user clicks/drags on ProgressBar
  const handleSeek = (newTime) => {
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  return (
    <div className="
      fixed bottom-0 left-0 right-0
      h-24
      bg-zinc-900
      border-t border-zinc-700
      flex items-center
      px-6
      gap-6
      z-50
    ">

      {/* NATIVE AUDIO ELEMENT */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* LEFT — Song info */}
      <div className="flex items-center gap-3 w-1/4">
        {currentSong ? (
          <>
            {currentSong.coverArt ? (
              <img
                src={currentSong.coverArt}
                alt={currentSong.title}
                className="w-14 h-14 rounded object-cover shrink-0"
              />
            ) : (
              <div
                className="w-14 h-14 rounded flex items-center justify-center text-sm font-medium text-white shrink-0"
                style={{ background: '#3a3a5c' }}
              >
                {currentSong.title?.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-white text-sm font-medium truncate">
                {currentSong.title}
              </p>
              <p className="text-gray-400 text-xs truncate">
                {currentSong.artist}
              </p>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-sm">No song selected</p>
        )}
      </div>

      {/* CENTER — Controls + Progress bar */}
      <div className="flex flex-col items-center gap-2 flex-1">
        <Controls
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onNext={nextSong}
          onPrevious={previousSong}
          onShuffle={toggleShuffle}
          onRepeat={cycleRepeat}
          isShuffled={isShuffled}
          repeatMode={repeatMode}
        />
        <ProgressBar
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
        />
      </div>

      {/* RIGHT — Volume control */}
      <div className="flex items-center gap-2 w-1/4 justify-end">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={(e) => {
            setVolume(parseFloat(e.target.value))
            if (isMuted) setIsMuted(false)
          }}
          className="w-24 accent-white cursor-pointer"
        />
      </div>
    </div>
  )
}

export default Player