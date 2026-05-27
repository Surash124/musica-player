// Favourites.jsx
// Shows all songs the user has hearted
// Route: /favourites

import { Heart } from 'lucide-react'
import SongList from '../components/SongList/SongList'
import useMusicStore from '../store/musicStore'

function Favourites() {

  const { songs, favourites } = useMusicStore()
  // favourites → array of song IDs ['abc', 'def', 'ghi']
  // songs      → array of full song objects

  // Join favourites IDs with full song objects
  // filter → keep only songs whose id is in favourites array
  // this gives us full song objects for every favourited song
  const favouriteSongs = songs.filter((song) =>
    favourites.includes(song.id)
  )

  return (
    <div className="px-8 py-6">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <Heart
          size={28}
          className="text-green-400 fill-green-400"
        />
        <h2 className="text-white text-2xl font-bold">
          Favourites
        </h2>
        {favouriteSongs.length > 0 && (
          <span className="text-gray-500 text-sm">
            {favouriteSongs.length} songs
          </span>
        )}
      </div>

      {/* EMPTY STATE — nothing hearted yet */}
      {favouriteSongs.length === 0 ? (
        <div className="
          flex flex-col items-center justify-center
          h-64 text-center gap-3
        ">
          <Heart size={48} className="text-zinc-700" />
          <p className="text-gray-400">No favourites yet</p>
          <p className="text-gray-600 text-sm">
            Click the heart on any song to save it here
          </p>
        </div>
      ) : (
        <SongList
          songs={favouriteSongs}
          showArtist={true}
          showHeader={true}
        />
      )}

    </div>
  )
}

export default Favourites