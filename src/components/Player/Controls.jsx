// Controls.jsx
// This component handles all playback buttons
// It receives functions and state as props from Player.jsx

// Icons from lucide-react — a free icon library
// install it first: npm install lucide-react
import { 
  Play, Pause,          // play/pause icon
  SkipBack, SkipForward, // previous/next track
  Shuffle, Repeat        // shuffle and repeat icons
} from 'lucide-react'

// Props this component expects from its parent (Player.jsx):
// isPlaying     → boolean, is a song currently playing?
// onPlayPause   → function, called when play/pause button clicked
// onNext        → function, called when skip forward clicked
// onPrevious    → function, called when skip back clicked
// onShuffle     → function, called when shuffle clicked
// onRepeat      → function, called when repeat clicked
// isShuffled    → boolean, is shuffle currently on?
// repeatMode    → string, 'none' | 'all' | 'one'

function Controls({ 
  isPlaying, 
  onPlayPause, 
  onNext, 
  onPrevious,
  onShuffle,
  onRepeat,
  isShuffled,
  repeatMode
}) {

  return (
    // flex → puts all buttons in a row
    // items-center → vertically centers them
    // gap-4 → space between each button
    <div className="flex items-center gap-4">

      {/* SHUFFLE BUTTON */}
      {/* isShuffled controls the color — active = white, inactive = gray */}
      <button
        onClick={onShuffle}
        className={`
          transition-colors duration-200
          ${isShuffled 
            ? 'text-green-400'   // green when shuffle is ON
            : 'text-gray-400 hover:text-white'  // gray when OFF
          }
        `}
      >
        <Shuffle size={18} />
      </button>

      {/* PREVIOUS BUTTON */}
      <button
        onClick={onPrevious}
        className="text-gray-400 hover:text-white transition-colors duration-200"
      >
        <SkipBack size={22} />
      </button>

      {/* PLAY / PAUSE BUTTON */}
      {/* This is the main button — bigger than the rest */}
      {/* rounded-full → makes it a circle */}
      {/* w-10 h-10 → width and height 40px */}
      <button
        onClick={onPlayPause}
        className="
          bg-white text-black 
          rounded-full 
          w-10 h-10 
          flex items-center justify-center
          hover:scale-105          
          transition-transform duration-200
        "
      >
        {/* Conditionally show Play or Pause icon based on isPlaying */}
        {isPlaying 
          ? <Pause size={20} />   // if playing → show pause icon
          : <Play size={20} />    // if paused → show play icon
        }
      </button>

      {/* NEXT BUTTON */}
      <button
        onClick={onNext}
        className="text-gray-400 hover:text-white transition-colors duration-200"
      >
        <SkipForward size={22} />
      </button>

      {/* REPEAT BUTTON */}
      {/* repeatMode has 3 states: 'none', 'all', 'one' */}
      <button
        onClick={onRepeat}
        className={`
          transition-colors duration-200
          ${repeatMode === 'none' 
            ? 'text-gray-400 hover:text-white'  // off
            : 'text-green-400'                   // on (all or one)
          }
        `}
      >
        <Repeat size={18} />
        {/* if repeatMode is 'one', show a small '1' on top of the icon */}
        {repeatMode === 'one' && (
          <span className="absolute text-[8px] font-bold">1</span>
        )}
      </button>

    </div>
  )
}

export default Controls