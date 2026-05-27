// SongItem.jsx
// Represents a single song row in the list
// Shows: number, cover art, title, artist, duration, favourite button
// Clicking the row plays the song
// ··· button opens a context menu to add to playlist or favourite

import { useState, useEffect } from 'react'
import { Heart, MoreHorizontal, Play } from 'lucide-react'
import useMusicStore from '../../store/musicStore'

function SongItem({ song, index, showArtist = true, songList }) {
  // song        → the song object
  // index       → position in the list (1, 2, 3...)
  // showArtist  → sometimes we don't need artist column
  //               e.g. inside an Artist page, artist is already obvious
  //               default is true — show artist by default
  // songList    → the sorted/filtered list this song belongs to
  //               used as the queue so next/previous matches screen order

  // Local hover state — controls whether we show
  // the play icon or the index number on the left
  const [isHovered, setIsHovered] = useState(false)

  // Controls the ··· context menu visibility
  const [menuOpen, setMenuOpen] = useState(false)

  // Pull what we need from global store
  const {
    currentSong,        // currently playing song
    isPlaying,          // is audio playing right now
    playSong,           // function to play a song
    toggleFavourite,    // function to like/unlike a song
    favourites,         // array of favourite song ids
    songs,              // full song list — fallback queue
    playlists,          // all playlists — shown in context menu
    addSongToPlaylist,  // function to add song to a playlist
  } = useMusicStore()

  // Is this specific song currently playing?
  const isCurrentSong = currentSong?.id === song.id
  // ?. → optional chaining, safe if currentSong is null

  // Is this song in favourites?
  // .some() → returns true if ANY item in array matches
  const isFavourited = favourites.some((fav) => fav === song.id)
  // we store just the id in favourites array, not the whole song object
  // saves memory and avoids duplicating song data

  // Close menu when clicking anywhere outside
  // useEffect runs when menuOpen changes
  // adds a global click listener that closes the menu
  // cleanup removes the listener when menu closes or component unmounts
  useEffect(() => {
    const handleClickOutside = () => setMenuOpen(false)
    if (menuOpen) {
      document.addEventListener('click', handleClickOutside)
    }
    return () => document.removeEventListener('click', handleClickOutside)
  }, [menuOpen])

  // Converts seconds to m:ss format
  // Same logic as ProgressBar — later we'll move this to utils/formatTime.js
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    // group → lets children react to hover on this row
    // onMouseEnter/Leave → track hover state locally
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => playSong(song, songList || songs)}
      // songList → sorted list from SongList.jsx (matches screen order)
      // songs → fallback to full library if no songList provided
      className={`
        group
        flex items-center
        gap-4
        px-4 py-2
        rounded-lg
        cursor-pointer
        transition-colors duration-150
        ${isCurrentSong
          ? 'bg-zinc-700'           // currently playing → slightly highlighted
          : 'hover:bg-zinc-800'     // not playing → highlight only on hover
        }
      `}
    >

      {/* LEFT — index number or play icon */}
      {/* w-8 → fixed width so all content aligns cleanly */}
      <div className="w-8 flex items-center justify-center shrink-0">
        {isCurrentSong && isPlaying ? (

          // CURRENTLY PLAYING — show animated bars
          <div className="flex items-end gap-px h-4">
            {[1, 2, 3].map((bar) => (
              <div
                key={bar}
                className="w-0.5 bg-green-400 rounded-full animate-bounce"
                // each bar gets a slightly different animation delay
                // so they bounce at different times — looks like audio bars
                style={{ 
                  animationDelay: `${bar * 0.1}s`,
                  height: `${bar * 4}px`
                }}
              />
            ))}
          </div>

        ) : isHovered ? (

          // HOVERED — show play icon
          <Play
            size={16}
            className="text-white fill-white"
            // fill-white → fills the play triangle solid
          />

        ) : (

          // DEFAULT — show track number
          <span className={`
            text-sm
            ${isCurrentSong ? 'text-green-400' : 'text-gray-500'}
          `}>
            {index + 1}
            {/* index is 0-based from .map(), add 1 for display */}
          </span>

        )}
      </div>

      {/* COVER ART */}
      {/* if coverArt exists show image, otherwise show initials */}
      {/* cleaner than onError — no flash of broken image */}
      {song.coverArt ? (
        <img
          src={song.coverArt}
          alt={song.title}
          className="w-10 h-10 rounded object-cover shrink-0"
          // shrink-0 → image never squishes even on small screens
        />
      ) : (
        // INITIALS FALLBACK
        // shown when no cover art is available
        <div
          className="
            w-10 h-10 rounded shrink-0
            flex items-center justify-center
            text-xs font-medium text-white
          "
          style={{ background: '#3a3a5c' }}
        >
          {song.title?.slice(0, 2).toUpperCase()}
          {/* slice(0,2) → first 2 characters e.g. "Bo" from "Bohemian Rhapsody" */}
        </div>
      )}

      {/* SONG TITLE + ARTIST */}
      {/* flex-1 → takes remaining space, pushes duration to the right */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <p className={`
          text-sm font-medium truncate
          ${isCurrentSong ? 'text-green-400' : 'text-white'}
        `}>
          {song.title}
        </p>

        {/* Only show artist if showArtist prop is true */}
        {showArtist && (
          <p className="text-xs text-gray-400 truncate">
            {song.artist}
          </p>
        )}
      </div>

      {/* FAVOURITE BUTTON */}
      {/* opacity-0 by default, visible on row hover OR if already favourited */}
      {/* stopPropagation → clicking heart doesn't also trigger playSong */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          // without this, clicking heart would bubble up
          // to the row's onClick and play the song too
          toggleFavourite(song.id)
        }}
        className={`
          shrink-0
          transition-all duration-150
          ${isFavourited
            ? 'opacity-100 text-green-400'              // always visible if favourited
            : 'opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white'
            // invisible until row is hovered
          }
        `}
      >
        <Heart
          size={16}
          className={isFavourited ? 'fill-green-400' : ''}
          // fill-green-400 → solid heart when favourited
          // no fill → outline heart when not favourited
        />
      </button>

      {/* DURATION */}
      <span className="
        text-xs text-gray-400
        shrink-0
        w-10 text-right
      ">
        {formatTime(song.duration)}
      </span>

      {/* MORE OPTIONS BUTTON (···) + CONTEXT MENU */}
      {/* relative → context menu positions itself relative to this div */}
      <div className="relative shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation()
            // stopPropagation → don't play the song when clicking ···
            setMenuOpen(prev => !prev)
            // toggle menu open/closed
          }}
          className="
            text-gray-400
            hover:text-white
            opacity-0
            group-hover:opacity-100
            transition-opacity duration-150
          "
        >
          <MoreHorizontal size={16} />
        </button>

        {/* CONTEXT MENU */}
        {/* only rendered when menuOpen is true */}
        {menuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            // stopPropagation → clicks inside menu don't bubble to row
            className="
              absolute bottom-6 right-0
              bg-zinc-800
              border border-zinc-700
              rounded-lg
              py-1
              w-48
              z-50
              shadow-xl
            "
          >

            {/* ADD TO PLAYLIST SECTION */}
            <p className="
              text-gray-500 text-xs
              px-3 py-1
              uppercase tracking-widest
            ">
              Add to playlist
            </p>

            {playlists.length === 0 ? (

              // no playlists created yet
              <p className="text-gray-600 text-xs px-3 py-2">
                No playlists yet
              </p>

            ) : (

              // show each playlist as a clickable option
              playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => {
                    addSongToPlaylist(playlist.id, song)
                    // adds this song to the chosen playlist in the store
                    setMenuOpen(false)
                    // close menu after adding
                  }}
                  className="
                    w-full text-left
                    px-3 py-2
                    text-sm text-gray-300
                    hover:bg-zinc-700
                    hover:text-white
                    transition-colors
                  "
                >
                  {playlist.name}
                </button>
              ))
            )}

            {/* DIVIDER */}
            <div className="border-t border-zinc-700 my-1" />

            {/* FAVOURITE TOGGLE */}
            <button
              onClick={() => {
                toggleFavourite(song.id)
                setMenuOpen(false)
              }}
              className="
                w-full text-left
                px-3 py-2
                text-sm text-gray-300
                hover:bg-zinc-700
                hover:text-white
                transition-colors
              "
            >
              {isFavourited
                ? 'Remove from favourites'
                : 'Add to favourites'
              }
            </button>

          </div>
        )}
      </div>

    </div>
  )
}

export default SongItem