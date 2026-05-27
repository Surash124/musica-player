// ArtistCard.jsx
// Represents a single artist
// Shows: artist photo/initial, name, song count
// Clicking navigates to that artist's detail page

import { useNavigate } from 'react-router-dom'

function ArtistCard({ artist }) {
  // artist object shape:
  // {
  //   name: 'Queen',
  //   coverArt: 'data:image/jpeg;base64,...' or null,
  //   songCount: 12
  // }

  const navigate = useNavigate()

  // Navigate to artist detail page on click
  const handleClick = () => {
    // encodeURIComponent → makes the name URL safe
    // "Led Zeppelin" → "Led%20Zeppelin"
    // without this, spaces and special characters break the URL
    navigate(`/artists/${encodeURIComponent(artist.name)}`)
  }

  // Generate initials from artist name as fallback when no cover art
  // "Led Zeppelin" → "LZ"
  // "Queen" → "Q"
  // "The Beatles" → "TB"
  const getInitials = (name) => {
    return name
      .split(' ')           // split by space → ['Led', 'Zeppelin']
      .map(word => word[0]) // take first letter of each word → ['L', 'Z']
      .join('')             // join back → 'LZ'
      .toUpperCase()        // ensure uppercase
      .slice(0, 2)          // max 2 characters → 'LZ'
  }

  return (
    <div
      onClick={handleClick}
      className="
        group
        flex flex-col items-center
        gap-3
        p-4
        rounded-lg
        cursor-pointer
        hover:bg-zinc-800
        transition-colors duration-200
        text-center
      "
    >

      {/* ARTIST IMAGE */}
      {/* Circle shape — artists use circles, albums use squares */}
      {/* This is the same convention Spotify uses */}
      <div className="
        w-full
        aspect-square
        rounded-full
        overflow-hidden
        bg-zinc-700
        flex items-center justify-center
        relative
      ">

        {artist.coverArt ? (

          // Has cover art from their song's ID3 tag — show it
          <img
            src={artist.coverArt}
            alt={artist.name}
            className="
              w-full h-full
              object-cover
              group-hover:scale-105
              transition-transform duration-300
            "
            // scale-105 on hover → subtle zoom effect
            // transition-transform → smooth animation
          />

        ) : (

          // No cover art — show initials on colored background
          // The color is derived from the artist name
          // so each artist gets a consistent color, not random
          <div
            className="
              w-full h-full
              flex items-center justify-center
              text-2xl font-medium
              select-none
            "
            style={{ background: getArtistColor(artist.name) }}
            // inline style because the color is dynamic
            // Tailwind can't handle dynamic values at runtime
          >
            {getInitials(artist.name)}
          </div>

        )}

      </div>

      {/* ARTIST INFO */}
      <div className="w-full overflow-hidden">

        <p className="
          text-white text-sm font-medium
          truncate
        ">
          {artist.name}
        </p>

        <p className="text-gray-400 text-xs mt-0.5">
          {artist.songCount} {artist.songCount === 1 ? 'song' : 'songs'}
        </p>

      </div>

    </div>
  )
}

// ─────────────────────────────────────────
// HELPER — Generate a consistent color from artist name
// ─────────────────────────────────────────

// This runs outside the component because it's a pure function
// it doesn't need access to props or state
// same input always gives same output

const getArtistColor = (name) => {
  // We want a consistent color for each artist
  // "Queen" should always be the same color, not random each render
  // Strategy: convert the name into a number, use that to pick a color

  // Step 1 — convert name to a number (hash)
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
    // charCodeAt(i) → ASCII code of each character
    // e.g. 'Q' → 81, 'u' → 117
    // hash << 5 → bitwise left shift (fast way to multiply by 32)
    // this math scrambles the characters into one big number
    // same name → same number every time
  }

  // Step 2 — pick a color from a fixed palette using the hash
  const colors = [
    '#1e3a5f',  // dark blue
    '#3b1f5e',  // dark purple
    '#1f3b2a',  // dark green
    '#5e1f1f',  // dark red
    '#3b2a1f',  // dark brown
    '#1f3b3b',  // dark teal
    '#3b3b1f',  // dark olive
    '#5e3b1f',  // dark orange
  ]

  // Math.abs → makes hash positive (it can be negative)
  // % colors.length → keeps index within array bounds
  const index = Math.abs(hash) % colors.length

  return colors[index]
}

export default ArtistCard