// ArtistDetail.jsx
// Shows one artist and all their songs
// Route: /artists/:artistName

import { useParams, useNavigate } from 'react-router-dom'
// useParams → reads URL parameters
// /artists/Queen → { artistName: 'Queen' }

import { ArrowLeft } from 'lucide-react'
import SongList from '../components/SongList/SongList'
import useMusicStore from '../store/musicStore'

function ArtistDetail() {

  const { artistName } = useParams()
  // artistName is the URL parameter we defined in the route
  // /artists/Led%20Zeppelin → artistName = 'Led%20Zeppelin'

  const decodedName = decodeURIComponent(artistName)
  // decodeURIComponent → reverses the encoding from ArtistCard
  // 'Led%20Zeppelin' → 'Led Zeppelin'

  const navigate = useNavigate()
  const { songs, artists } = useMusicStore()

  // Find this artist's full object from the store
  const artist = artists.find((a) => a.name === decodedName)

  // Filter songs to only this artist's songs
  const artistSongs = songs.filter((s) => s.artist === decodedName)

  // Artist not found — show error
  // This can happen if user navigates directly to a bad URL
  if (!artist) {
    return (
      <div className="
        flex flex-col items-center justify-center
        h-full gap-4 text-center
      ">
        <p className="text-gray-400">Artist not found</p>
        <button
          onClick={() => navigate('/artists')}
          className="text-sm text-gray-600 hover:text-white transition-colors"
        >
          Back to Artists
        </button>
      </div>
    )
  }

  return (
    <div>

      {/* ARTIST HERO SECTION */}
      {/* Big header with artist image and name */}
      <div className="
        relative
        h-56
        flex items-end
        px-8 pb-6
        bg-gradient-to-b from-zinc-700 to-zinc-900
        // gradient gives depth to the header
      ">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          // navigate(-1) → go back to previous page
          // like pressing the browser back button
          className="
            absolute top-6 left-6
            text-white
            hover:text-gray-300
            transition-colors
          "
        >
          <ArrowLeft size={22} />
        </button>

        {/* Artist image or initials */}
        <div className="flex items-end gap-6">
          <div className="
            w-28 h-28
            rounded-full
            overflow-hidden
            bg-zinc-600
            flex items-center justify-center
            flex-shrink-0
            border-4 border-zinc-900
          ">
            {artist.coverArt ? (
              <img
                src={artist.coverArt}
                alt={artist.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-white">
                {artist.name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          {/* Artist name and song count */}
          <div className="pb-2">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">
              Artist
            </p>
            <h2 className="text-white text-3xl font-bold">
              {artist.name}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {artistSongs.length} {artistSongs.length === 1 ? 'song' : 'songs'}
            </p>
          </div>
        </div>

      </div>

      {/* SONGS LIST */}
      <div className="px-4 py-4">
        <SongList
          songs={artistSongs}
          showArtist={false}
          // showArtist false — we're already on an artist page
          // showing artist name on every row would be redundant
          showHeader={true}
        />
      </div>

    </div>
  )
}

export default ArtistDetail