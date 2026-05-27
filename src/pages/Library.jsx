// Library.jsx
// Shows ALL songs in the library
// The main music browsing screen

import SongList from '../components/SongList/SongList'
import useMusicStore from '../store/musicStore'

function Library() {

  const { songs } = useMusicStore()

  return (
    <div className="px-8 py-6">

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-2xl font-bold">
          Library
        </h2>
        {songs.length > 0 && (
          <span className="text-gray-500 text-sm">
            {songs.length} songs
          </span>
        )}
      </div>

      {/* SongList handles its own empty state */}
      {/* if songs is empty it shows "Open a folder" message */}
      <SongList
        songs={songs}
        showArtist={true}
        showHeader={true}
      />

    </div>
  )
}

export default Library