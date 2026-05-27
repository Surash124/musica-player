// PlaylistCard.jsx
// Represents a single playlist
// Shows cover art (mosaic of song covers), name, song count
// Clicking it navigates to that playlist's detail page

import { useNavigate } from 'react-router-dom'
// useNavigate → programmatically navigate to a page
// used here because we want to navigate on card click
// not just on a link click

import { Music } from 'lucide-react'
// fallback icon when playlist has no songs

function PlaylistCard({ playlist }) {
  // playlist object shape:
  // {
  //   id: 'abc123',
  //   name: 'My Playlist',
  //   songs: [ ...song objects ]
  // }

  const navigate = useNavigate()

  // Get first 4 songs from playlist to make a mosaic cover
  // If playlist has less than 4 songs, we work with what we have
  const coverSongs = playlist.songs.slice(0, 4)
  // slice(0, 4) → takes first 4 items from array
  // does NOT mutate the original array

  // Navigate to this playlist's detail page when card is clicked
  const handleClick = () => {
    navigate(`/playlists/${playlist.id}`)
    // template literal builds the URL dynamically
    // e.g. /playlists/abc123
  }

  return (
    // group → lets child elements react to hover on this card
    // cursor-pointer → shows hand cursor on hover
    <div
      onClick={handleClick}
      className="
        group
        bg-zinc-800
        rounded-lg
        p-4
        cursor-pointer
        hover:bg-zinc-700
        transition-colors duration-200
        flex flex-col gap-3
      "
    >

      {/* PLAYLIST COVER ART */}
      {/* Shows a 2x2 mosaic of song covers if 4+ songs exist */}
      {/* Shows a single cover if 1-3 songs */}
      {/* Shows a placeholder if no songs */}
      <div className="
        w-full aspect-square
        rounded-md
        overflow-hidden
        bg-zinc-700
      ">
        {/* aspect-square → keeps the cover perfectly square
            regardless of the card's width */}

        {coverSongs.length === 0 ? (

          // EMPTY STATE — no songs yet, show placeholder icon
          <div className="
            w-full h-full
            flex items-center justify-center
          ">
            <Music size={40} className="text-zinc-500" />
          </div>

        ) : coverSongs.length < 4 ? (

          // SINGLE COVER — less than 4 songs, just show first song's art
          <img
            src={coverSongs[0].coverArt || '/default-cover.png'}
            alt={playlist.name}
            className="w-full h-full object-cover"
          />

        ) : (

          // MOSAIC — 4 songs, show 2x2 grid of their covers
          // grid-cols-2 → 2 columns
          // each image takes exactly half the width and half the height
          <div className="grid grid-cols-2 w-full h-full">
            {coverSongs.map((song, index) => (
              <img
                key={index}
                src={song.coverArt || '/default-cover.png'}
                alt={song.title}
                className="w-full h-full object-cover"
                // object-cover → fills its cell without stretching
              />
            ))}
          </div>

        )}
      </div>

      {/* PLAYLIST INFO */}
      <div className="flex flex-col gap-1">

        {/* Playlist name */}
        <p className="
          text-white text-sm font-medium
          truncate
          group-hover:text-white
        ">
          {playlist.name}
        </p>

        {/* Song count */}
        <p className="text-gray-400 text-xs">
          {playlist.songs.length === 0
            ? 'Empty playlist'
            : `${playlist.songs.length} song${playlist.songs.length === 1 ? '' : 's'}`
            // adds 's' for plural — "1 song" vs "3 songs"
          }
        </p>

      </div>

    </div>
  )
}

export default PlaylistCard