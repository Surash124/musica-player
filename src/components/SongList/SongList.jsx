// SongList.jsx
// Renders a full list of songs using SongItem
// Handles: sorting, empty state, optional header row
// Used in: Library page, Artist detail, Playlist detail

import { useState } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import SongItem from './SongItem'

function SongList({ songs, showArtist = true, showHeader = true, fullQueue }) {
  // songs       → array of song objects to display
  // showArtist  → passed down to SongItem
  // showHeader  → show the column headers (Title, Artist, Duration)
  //               sometimes we don't want headers e.g. in a small widget

  // Sorting state
  // sortBy   → which column to sort by: 'title' | 'artist' | 'duration'
  // sortDir  → direction: 'asc' | 'desc'
  const [sortBy, setSortBy] = useState(null)
  // null means no sort applied — show songs in original order
  const [sortDir, setSortDir] = useState('asc')

  // Called when a column header is clicked
  const handleSort = (column) => {
    if (sortBy === column) {
      // clicking the same column toggles direction
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      // clicking a new column — sort by that column ascending
      setSortBy(column)
      setSortDir('asc')
    }
  }

  // Returns the correct icon for a column header
  // based on whether it's sorted and in which direction
  const SortIcon = ({ column }) => {
    if (sortBy !== column) return <ArrowUpDown size={14} className="text-gray-600" />
    if (sortDir === 'asc')  return <ArrowUp size={14} className="text-white" />
    return <ArrowDown size={14} className="text-white" />
  }

  // Sort the songs array
  // We never mutate the original array — [...songs] creates a copy first
  const sortedSongs = [...songs].sort((a, b) => {
    if (!sortBy) return 0
    // no sort applied → keep original order
    // returning 0 means "these two are equal, don't swap"

    let valA = a[sortBy]  // e.g. a['title'] → "Bohemian Rhapsody"
    let valB = b[sortBy]  // e.g. b['title'] → "Stairway to Heaven"

    // For strings — localeCompare handles special characters correctly
    // "é" "ñ" "ü" etc sort properly across languages
    if (typeof valA === 'string') {
      const comparison = valA.localeCompare(valB)
      return sortDir === 'asc' ? comparison : -comparison
      // negate the comparison to reverse direction
    }

    // For numbers (duration)
    if (typeof valA === 'number') {
      return sortDir === 'asc' ? valA - valB : valB - valA
    }

    return 0
  })

  // EMPTY STATE — no songs to show
  if (songs.length === 0) {
    return (
      <div className="
        flex flex-col items-center justify-center
        h-48
        text-center
        gap-2
      ">
        <p className="text-gray-400">No songs found</p>
        <p className="text-gray-600 text-sm">
          Open a folder to load your music
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">

      {/* COLUMN HEADERS */}
      {showHeader && (
        <div className="
          flex items-center
          gap-4
          px-4 py-2
          border-b border-zinc-800
          mb-1
        ">

          {/* # column — fixed width matches SongItem's index column */}
          <div className="w-8 shrink-0" />

          {/* Cover art column — fixed width matches SongItem's image */}
          <div className="w-10 shrink-0" />

          {/* TITLE column — clickable to sort */}
          <button
            onClick={() => handleSort('title')}
            className="
              flex items-center gap-1
              flex-1
              text-xs font-medium
              text-gray-500
              hover:text-white
              transition-colors
              text-left
            "
          >
            Title
            <SortIcon column="title" />
          </button>

          {/* ARTIST column — only shown if showArtist is true */}
          {showArtist && (
            <button
              onClick={() => handleSort('artist')}
              className="
                flex items-center gap-1
                w-32
                text-xs font-medium
                text-gray-500
                hover:text-white
                transition-colors
                text-left
              "
            >
              Artist
              <SortIcon column="artist" />
            </button>
          )}

          {/* Spacer to align with the favourite button in SongItem */}
          <div className="w-4 shrink-0" />

          {/* DURATION column */}
          <button
            onClick={() => handleSort('duration')}
            className="
              flex items-center gap-1
              w-10
              text-xs font-medium
              text-gray-500
              hover:text-white
              transition-colors
            "
          >
            <SortIcon column="duration" />
          </button>

          {/* Spacer to align with ··· button in SongItem */}
          <div className="w-4 shrink-0" />

        </div>
      )}

      {/* SONG ROWS */}
      {/* pass sortedSongs as songList so next/previous follows */}
      {/* the exact order shown on screen, not the store order */}
      {sortedSongs.map((song, index) => (
        <SongItem
          key={song.id}
          song={song}
          index={index}
          showArtist={showArtist}
          songList={fullQueue || sortedSongs}
// fullQueue → use full library if provided (Home page)
// sortedSongs → use displayed list if no fullQueue (Library, Artist pages)
          // songList → the sorted version of songs
          // SongItem uses this as the queue when a song is clicked
          // so next/previous always matches what you see on screen
        />
      ))}

    </div>
  )
}

export default SongList