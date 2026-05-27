// PlaylistList.jsx
// Displays all playlists in a grid
// Also has a button to create a new playlist
// This is the /playlists page content

import { useState } from 'react'
import { Plus } from 'lucide-react'
import PlaylistCard from './PlaylistCard'
import useMusicStore from '../../store/musicStore'

function PlaylistList() {

  // Pull playlists and createPlaylist function from global store
  const { playlists, createPlaylist } = useMusicStore()

  // Local state for the new playlist modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  // These two only matter to this component
  // no other component cares about the modal being open
  // so local state is the right choice here, not the global store

  // Called when user confirms creating a new playlist
  const handleCreate = () => {
    // trim() removes whitespace from both ends
    // prevents creating a playlist named "   "
    if (!newPlaylistName.trim()) return

    createPlaylist(newPlaylistName.trim())  // add to global store

    // Reset and close
    setNewPlaylistName('')
    setIsModalOpen(false)
  }

  // Called when user presses Enter in the input field
  // More convenient than clicking the button every time
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCreate()
    if (e.key === 'Escape') setIsModalOpen(false)
    // Escape closes modal without creating
  }

  return (
    // Main container
    // px-8 py-6 → breathing room from edges
    <div className="px-8 py-6">

      {/* HEADER ROW */}
      <div className="flex items-center justify-between mb-6">

        <h2 className="text-white text-2xl font-bold">
          Your Playlists
        </h2>

        {/* CREATE PLAYLIST BUTTON */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="
            flex items-center gap-2
            bg-white text-black
            text-sm font-medium
            px-4 py-2
            rounded-full
            hover:bg-gray-200
            transition-colors duration-200
          "
        >
          <Plus size={16} />
          New Playlist
        </button>

      </div>

      {/* PLAYLISTS GRID or EMPTY STATE */}
      {playlists.length === 0 ? (

        // EMPTY STATE
        <div className="
          flex flex-col items-center justify-center
          h-64
          text-center
          gap-3
        ">
          <p className="text-gray-400 text-lg">No playlists yet</p>
          <p className="text-gray-600 text-sm">
            Click "New Playlist" to create your first one
          </p>
        </div>

      ) : (

        // GRID OF PLAYLIST CARDS
        // grid-cols-2 on small screens
        // grid-cols-3 on medium screens
        // grid-cols-4 on large screens
        // gap-4 → space between cards
        <div className="
          grid
          grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
          gap-4
        ">
          {playlists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              // key → React needs this to track which card is which
              // when the list updates, React uses key to know
              // what changed, what stayed, what was removed
              // always use a unique stable id, never the array index
              playlist={playlist}
            />
          ))}
        </div>

      )}

      {/* CREATE PLAYLIST MODAL */}
      {/* Only rendered when isModalOpen is true */}
      {isModalOpen && (

        // BACKDROP — dark overlay behind the modal
        // fixed inset-0 → covers entire screen
        // z-50 → on top of everything
        // onClick on backdrop closes modal when clicking outside
        <div
          onClick={() => setIsModalOpen(false)}
          className="
            fixed inset-0
            bg-black bg-opacity-60
            flex items-center justify-center
            z-50
          "
        >

          {/* MODAL BOX */}
          {/* stopPropagation → clicking inside modal doesn't
              bubble up to the backdrop and close it */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="
              bg-zinc-800
              rounded-xl
              p-6
              w-80
              flex flex-col gap-4
              shadow-2xl
            "
          >

            <h3 className="text-white text-lg font-semibold">
              New Playlist
            </h3>

            {/* NAME INPUT */}
            <input
              type="text"
              placeholder="Playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              // onChange fires on every keystroke
              // updates newPlaylistName state
              // React re-renders input with new value
              // this is called a controlled input
              onKeyDown={handleKeyDown}
              autoFocus
              // autoFocus → cursor goes straight into input when modal opens
              className="
                bg-zinc-700
                text-white
                placeholder-gray-500
                rounded-lg
                px-4 py-2.5
                text-sm
                outline-none
                focus:ring-2 focus:ring-white
                transition-all duration-150
              "
            />

            {/* ACTION BUTTONS */}
            <div className="flex gap-2 justify-end">

              {/* CANCEL */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="
                  text-gray-400
                  hover:text-white
                  text-sm px-4 py-2
                  rounded-lg
                  hover:bg-zinc-700
                  transition-colors duration-150
                "
              >
                Cancel
              </button>

              {/* CREATE */}
              <button
                onClick={handleCreate}
                // disabled if input is empty or only spaces
                disabled={!newPlaylistName.trim()}
                className="
                  bg-white text-black
                  text-sm font-medium
                  px-4 py-2
                  rounded-lg
                  hover:bg-gray-200
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                  transition-all duration-150
                "
              >
                Create
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}

export default PlaylistList