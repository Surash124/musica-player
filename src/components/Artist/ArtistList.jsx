// ArtistList.jsx
// Displays all artists in a grid
// Also has a search bar to filter artists by name
// This is the /artists page content

import { useState } from 'react'
import { Search } from 'lucide-react'
import ArtistCard from './ArtistCard'
import useMusicStore from '../../store/musicStore'

function ArtistList() {

  // Pull artists from global store
  // Remember: artists are built automatically in setSongs()
  // from the songs array — we never manually add artists
  const { artists } = useMusicStore()

  // Local search state
  // Only this component needs it — local state is right
  const [searchQuery, setSearchQuery] = useState('')

  // Filter artists based on search query
  // .toLowerCase() on both sides → case insensitive search
  // "queen" matches "Queen", "QUEEN", "QuEeN"
  const filteredArtists = artists.filter((artist) =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  // .includes() → true if the string contains the query anywhere
  // "Queen" .includes("uee") → true
  // This runs on every render but it's fast enough for a music library

  return (
    <div className="px-8 py-6">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">

        <h2 className="text-white text-2xl font-bold">Artists</h2>

        {/* SEARCH BAR */}
        {/* only shown if there are artists to search through */}
        {artists.length > 0 && (
          <div className="
            flex items-center gap-2
            bg-zinc-800
            border border-zinc-700
            rounded-full
            px-4 py-2
            w-52
          ">
            <Search size={14} className="text-gray-500 shrink-0" />
            <input
              type="text"
              placeholder="Search artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                bg-transparent
                text-white text-sm
                placeholder-gray-600
                outline-none
                w-full
              "
              // bg-transparent → input blends into the container
              // outline-none → removes default browser focus ring
              // we handle focus styling on the parent div instead
            />
          </div>
        )}

      </div>

      {/* EMPTY STATE — no songs loaded yet */}
      {artists.length === 0 ? (
        <div className="
          flex flex-col items-center justify-center
          h-64 text-center gap-3
        ">
          <p className="text-gray-400">No artists yet</p>
          <p className="text-gray-600 text-sm">
            Open a music folder to see your artists
          </p>
        </div>

      // NO RESULTS — search returned nothing
      ) : filteredArtists.length === 0 ? (
        <div className="
          flex flex-col items-center justify-center
          h-40 text-center gap-2
        ">
          <p className="text-gray-400 text-sm">
            No artists found for "{searchQuery}"
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-gray-600 hover:text-white transition-colors"
          >
            Clear search
          </button>
        </div>

      // ARTIST GRID
      ) : (
        // More columns than playlists because artist cards are smaller
        // Artists are circular so they can fit more per row
        <div className="
          grid
          grid-cols-3
          md:grid-cols-4
          lg:grid-cols-5
          xl:grid-cols-6
          gap-4
        ">
          {filteredArtists.map((artist) => (
            <ArtistCard
              key={artist.name}
              // artist.name as key because artists don't have an id
              // name is unique — no two artists have the same name
              artist={artist}
            />
          ))}
        </div>
      )}

    </div>
  )
}

export default ArtistList