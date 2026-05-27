// Home.jsx
// Landing screen — shown when app first opens
// Shows recently played and quick stats
// If no music loaded yet — shows a welcome screen

import { useNavigate } from 'react-router-dom'
import { FolderOpen } from 'lucide-react'
import SongList from '../components/SongList/SongList'
import useMusicStore from '../store/musicStore'
import useLibrary from '../hooks/useLibrary'

function Home() {

  const navigate = useNavigate()
  const { songs, currentSong, playSong } = useMusicStore()
  const { openFolder, isLoading, progress } = useLibrary()

  // Get 5 most recently added songs to show as "Recent"
  // slice(-5) → takes last 5 items from array
  // .reverse() → most recent first(removed)
  const recentSongs = [...songs].slice(-5)

  // NO MUSIC LOADED — show welcome screen
  if (songs.length === 0) {
    return (
      <div className="
        flex flex-col items-center justify-center
        h-full
        gap-6
        text-center
        px-8
      ">

        {/* Big icon */}
        <div className="
          w-24 h-24
          rounded-full
          bg-zinc-800
          flex items-center justify-center
        ">
          <span className="text-5xl">🎵</span>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-white text-2xl font-bold">
            Welcome to Musica
          </h2>
          <p className="text-gray-400 text-sm max-w-xs">
            Open your music folder to get started.
            Your songs, artists and playlists will appear here.
          </p>
        </div>

        {/* Open folder button */}
        <button
          onClick={openFolder}
          disabled={isLoading}
          className="
            flex items-center gap-2
            bg-white text-black
            px-6 py-3
            rounded-full
            font-medium
            hover:bg-gray-200
            disabled:opacity-50
            transition-all duration-200
          "
        >
          <FolderOpen size={18} />
          {isLoading ? 'Scanning...' : 'Open Music Folder'}
        </button>

        {/* Progress indicator while scanning */}
        {isLoading && progress.total > 0 && (
          <p className="text-gray-500 text-sm">
            Scanning {progress.current} of {progress.total} songs...
          </p>
        )}

      </div>
    )
  }

  // MUSIC LOADED — show home screen
  return (
    <div className="px-8 py-6 flex flex-col gap-8">

      {/* GREETING */}
      <div>
        <h2 className="text-white text-2xl font-bold">Good to see you</h2>
        <p className="text-gray-400 text-sm mt-1">
          {songs.length} songs in your library
        </p>
      </div>

      {/* QUICK STATS */}
      {/* Shows a summary of the library at a glance */}
      <StatsRow />

      {/* RECENTLY ADDED */}
      {recentSongs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-lg font-semibold">
              Recently added
            </h3>
            <button
              onClick={() => navigate('/library')}
              className="text-gray-400 text-sm hover:text-white transition-colors"
            >
              See all
            </button>
          </div>

          {/* pass fullQueue={songs} so next/previous cycles through */}
          {/* ALL songs in the library, not just the 5 shown here */}
          {/* without this, next after song 5 would stop */}
          <SongList
            songs={recentSongs}
            showArtist={true}
            showHeader={false}
            fullQueue={songs}
            // showHeader false — no column labels needed for 5 songs
          />
        </section>
      )}

    </div>
  )
}

// Small stats row component
// Defined in this file because it's only used here
function StatsRow() {
  const { songs, artists, playlists, favourites } = useMusicStore()

  const stats = [
    { label: 'Songs',     value: songs.length },
    { label: 'Artists',   value: artists.length },
    { label: 'Playlists', value: playlists.length },
    { label: 'Favourites',value: favourites.length },
  ]

  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="
            bg-zinc-800
            rounded-xl
            px-4 py-4
            flex flex-col gap-1
          "
        >
          <span className="text-2xl font-bold text-white">
            {stat.value}
          </span>
          <span className="text-gray-400 text-xs">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  )
}

export default Home