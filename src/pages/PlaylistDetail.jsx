// PlaylistDetail.jsx
// Shows one playlist and all its songs
// Route: /playlists/:playlistId

import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Play } from 'lucide-react'
import SongList from '../components/SongList/SongList'
import useMusicStore from '../store/musicStore'

function PlaylistDetail() {

  const { playlistId } = useParams()
  const navigate = useNavigate()

  const {
    playlists,
    deletePlaylist,
    playSong,
  } = useMusicStore()

  // Find this specific playlist by id
  const playlist = playlists.find((p) => p.id === playlistId)

  // Playlist not found
  if (!playlist) {
    return (
      <div className="
        flex flex-col items-center justify-center
        h-full gap-4 text-center
      ">
        <p className="text-gray-400">Playlist not found</p>
        <button
          onClick={() => navigate('/playlists')}
          className="text-sm text-gray-600 hover:text-white transition-colors"
        >
          Back to Playlists
        </button>
      </div>
    )
  }

  // Play all songs in this playlist starting from the first
  const handlePlayAll = () => {
    if (playlist.songs.length === 0) return
    playSong(playlist.songs[0], playlist.songs)
    // playSong(firstSong, entirePlaylistAsQueue)
    // the whole playlist becomes the queue
  }

  // Delete playlist and go back
  const handleDelete = () => {
    // In a real app you'd show a confirmation modal first
    // for now just delete immediately
    deletePlaylist(playlist.id)
    navigate('/playlists')
  }

  return (
    <div>

      {/* PLAYLIST HEADER */}
      <div className="
        relative
        px-8 py-8
        bg-gradient-to-b from-zinc-700 to-zinc-900
        flex items-end gap-6
      ">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="
            absolute top-6 left-6
            text-white hover:text-gray-300
            transition-colors
          "
        >
          <ArrowLeft size={22} />
        </button>

        {/* Playlist cover — mosaic if 4+ songs, single if less */}
        <div className="
          w-32 h-32
          rounded-lg
          overflow-hidden
          bg-zinc-600
          flex-shrink-0
          mt-8
        ">
          {playlist.songs.length === 0 ? (

            // Empty playlist placeholder
            <div className="
              w-full h-full
              flex items-center justify-center
              bg-zinc-700
            ">
              <span className="text-4xl">🎵</span>
            </div>

          ) : playlist.songs.length < 4 ? (

            <img
              src={playlist.songs[0].coverArt || '/default-cover.png'}
              alt={playlist.name}
              className="w-full h-full object-cover"
            />

          ) : (

            <div className="grid grid-cols-2 w-full h-full">
              {playlist.songs.slice(0, 4).map((song, i) => (
                <img
                  key={i}
                  src={song.coverArt || '/default-cover.png'}
                  alt={song.title}
                  className="w-full h-full object-cover"
                />
              ))}
            </div>

          )}
        </div>

        {/* Playlist info */}
        <div className="flex flex-col gap-2 pb-2">
          <p className="text-gray-400 text-xs uppercase tracking-widest">
            Playlist
          </p>
          <h2 className="text-white text-3xl font-bold">
            {playlist.name}
          </h2>
          <p className="text-gray-400 text-sm">
            {playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}
          </p>
        </div>

      </div>

      {/* ACTION BUTTONS */}
      <div className="flex items-center gap-4 px-8 py-4">

        {/* Play all */}
        <button
          onClick={handlePlayAll}
          disabled={playlist.songs.length === 0}
          className="
            flex items-center gap-2
            bg-white text-black
            px-5 py-2
            rounded-full
            text-sm font-medium
            hover:bg-gray-200
            disabled:opacity-40
            disabled:cursor-not-allowed
            transition-all duration-200
          "
        >
          <Play size={16} className="fill-black" />
          Play all
        </button>

        {/* Delete playlist */}
        <button
          onClick={handleDelete}
          className="
            flex items-center gap-2
            text-gray-400
            hover:text-red-400
            text-sm
            transition-colors duration-200
            px-3 py-2
            rounded-lg
            hover:bg-zinc-800
          "
        >
          <Trash2 size={16} />
          Delete
        </button>

      </div>

      {/* SONGS */}
      <div className="px-4">
        {playlist.songs.length === 0 ? (
          <div className="
            flex flex-col items-center justify-center
            h-40 text-center gap-2
          ">
            <p className="text-gray-400 text-sm">
              This playlist is empty
            </p>
            <p className="text-gray-600 text-xs">
              Right click any song and add it here
            </p>
          </div>
        ) : (
          <SongList
            songs={playlist.songs}
            showArtist={true}
            showHeader={true}
          />
        )}
      </div>

    </div>
  )
}

export default PlaylistDetail