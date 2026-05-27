// ProgressBar.jsx
// Shows current position in the song
// User can click or drag to seek to any position

// Props expected:
// currentTime  → number, seconds elapsed (e.g. 63)
// duration     → number, total song length in seconds (e.g. 217)
// onSeek       → function, called with new time when user clicks the bar

function ProgressBar({ currentTime, duration, onSeek }) {

  // Converts seconds into "m:ss" format
  // Example: 217 → "3:37"
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'  // handle empty/invalid

    const mins = Math.floor(seconds / 60)    // full minutes
    const secs = Math.floor(seconds % 60)    // remaining seconds

    // padStart(2, '0') → ensures seconds always 2 digits: 7 → "07"
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Calculates how far along the song we are as a percentage
  // Used to position the progress fill and the thumb dot
  // Example: currentTime=63, duration=217 → 29.03%
  const progressPercent = duration 
    ? (currentTime / duration) * 100 
    : 0   // if no duration yet, default to 0

  // Called when user clicks anywhere on the bar
  // Figures out exactly where they clicked and seeks to that position
  const handleClick = (e) => {
    // e.currentTarget → the bar element itself
    const bar = e.currentTarget.getBoundingClientRect() 
    // getBoundingClientRect() → gives position and size of element on screen

    const clickX = e.clientX - bar.left   
    // e.clientX → where user clicked on screen (from left edge of window)
    // bar.left → where the bar starts on screen
    // clickX → how far from the start of the bar they clicked

    const clickPercent = clickX / bar.width  
    // bar.width → total width of the bar
    // clickPercent → 0 to 1, how far along they clicked

    const newTime = clickPercent * duration  
    // convert percent back to seconds

    onSeek(newTime)  // tell the audio player to jump to this time
  }

  return (
    // Outer wrapper — holds the bar and the time stamps
    <div className="flex items-center gap-3 w-full">

      {/* Current time — left side */}
      <span className="text-xs text-gray-400 w-8 text-right">
        {formatTime(currentTime)}
      </span>

      {/* THE BAR */}
      {/* relative → needed so the fill div can be positioned inside it */}
      {/* group → lets child elements react to hover on this parent */}
      <div
        onClick={handleClick}
        className="
          relative 
          flex-1          
          h-1             
          bg-gray-600     
          rounded-full    
          cursor-pointer  
          group           
        "
      >
        {/* FILL — the colored part showing progress */}
        {/* absolute → sits on top of the gray bar */}
        {/* h-full → same height as parent bar */}
        {/* width is set dynamically based on progressPercent */}
        <div
          className="
            absolute 
            top-0 left-0 
            h-full 
            bg-white 
            rounded-full
            group-hover:bg-green-400   
          "
          style={{ width: `${progressPercent}%` }}  
          // inline style because Tailwind can't handle dynamic values
        />

        {/* THUMB DOT — the small circle on the progress bar */}
        {/* Only visible on hover (opacity-0 by default, opacity-100 on group-hover) */}
        {/* absolute positioning places it exactly at the progress point */}
        <div
          className="
            absolute 
            top-1/2 
            -translate-y-1/2    
            -translate-x-1/2    
            w-3 h-3             
            bg-white 
            rounded-full
            opacity-0                    
            group-hover:opacity-100      
            transition-opacity duration-150
          "
          style={{ left: `${progressPercent}%` }}  
        />
      </div>

      {/* Total duration — right side */}
      <span className="text-xs text-gray-400 w-8">
        {formatTime(duration)}
      </span>

    </div>
  )
}

export default ProgressBar