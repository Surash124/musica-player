import { useEffect, useRef } from 'react';

export const useAudio = () => {
  const audioRef = useRef(new Audio());
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    
    // 1. Force the browser to aggressively buffer local files for smoother playback
    audio.preload = "auto"; 

    // 2. Set up the Web Audio Context equalizer when audio starts playing
    const handlePlay = () => {
      if (!audioContextRef.current) {
        // Initialize the browser's audio engine
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        audioContextRef.current = ctx;

        // Connect your existing audio element into the context pipeline
        const source = ctx.createMediaElementSource(audio);
        sourceRef.current = source;

        // Create a High-Shelf Filter to boost clarity/tinny details
        const trebleFilter = ctx.createBiquadFilter();
        trebleFilter.type = "highshelf";
        trebleFilter.frequency.value = 3000; // Target frequencies above 3kHz
        trebleFilter.gain.value = 3.0;       // Boost by 3 decibels for crispness

        // Pipeline: Audio File -> Treble Boost Filter -> Your Speakers
        source.connect(trebleFilter);
        trebleFilter.connect(ctx.destination);
      }
      
      // Resume context if browser suspended it
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };

    audio.addEventListener('play', handlePlay);

    return () => {
      audio.removeEventListener('play', handlePlay);
    };
  }, []);

  // Return your play, pause, and control functions down here...
};