// Sidebar.jsx
// The left navigation panel of the app
// Always visible, lets user navigate between pages
// Also has the "Open Folder" button to load music

import { NavLink } from 'react-router-dom'
// NavLink is like a normal <a> tag but for React apps
// It knows which link is currently active (current page)
// install: npm install react-router-dom

import {
  Home,         // home icon
  Music,        // library/songs icon
  Heart,        // favourites icon
  ListMusic,    // playlists icon
  Mic2,         // artists icon
  FolderOpen,   // open folder icon
} from 'lucide-react'

import useMusicStore from '../../store/musicStore'  // global state
import useLibrary from '../../hooks/useLibrary'      // folder reading logic

function Sidebar() {

  // Pull playlists from global store to display in sidebar
  const { playlists } = useMusicStore()

  // openFolder comes from useLibrary hook
  // It handles the File System Access API — picking a folder
  const { openFolder } = useLibrary()

  // Navigation links config
  // Keeping them in an array means we just loop once
  // instead of repeating the same JSX 5 times
  const navLinks = [
    { to: '/',           icon: Home,      label: 'Home'       },
    { to: '/library',    icon: Music,     label: 'Library'    },
    { to: '/artists',    icon: Mic2,      label: 'Artists'    },
    { to: '/playlists',  icon: ListMusic, label: 'Playlists'  },
    { to: '/favourites', icon: Heart,     label: 'Favourites' },
  ]

  return (
    // fixed → stays in place while page content scrolls
    // h-screen → full height of the screen
    // w-56 → fixed width, 224px
    // pb-24 → padding bottom so content doesn't hide behind the Player bar
    <aside className="
      fixed top-0 left-0
      h-screen w-56
      bg-zinc-900
      flex flex-col
      pb-24
      z-40
    ">

      {/* APP LOGO / NAME */}
      <div className="px-6 py-6">
        <h1 className="text-white text-xl font-bold tracking-tight">
          🎵 Musica
        </h1>
      </div>

      {/* OPEN FOLDER BUTTON */}
      {/* This is how the user loads their local music */}
      <div className="px-4 mb-4">
        <button
          onClick={openFolder}
          // w-full → stretches button full width of sidebar
          // gap-2 → space between icon and text
          className="
            w-full
            flex items-center gap-2
            bg-white text-black
            text-sm font-medium
            px-4 py-2
            rounded-full
            hover:bg-gray-200
            transition-colors duration-200
          "
        >
          <FolderOpen size={16} />
          Open Folder
        </button>
      </div>

      {/* DIVIDER */}
      <div className="border-t border-zinc-700 mx-4 mb-4" />

      {/* MAIN NAVIGATION LINKS */}
      <nav className="flex flex-col gap-1 px-2">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            // end → only mark Home as active when EXACTLY on '/'
            // without this, Home would be active on every page
            // because every path starts with '/'

            className={({ isActive }) =>
              // NavLink passes { isActive } so we can style the active link
              `
                flex items-center gap-3
                px-4 py-2.5
                rounded-lg
                text-sm
                transition-colors duration-150
                ${isActive
                  ? 'bg-zinc-700 text-white font-medium'   // active page
                  : 'text-gray-400 hover:text-white hover:bg-zinc-800'  // inactive
                }
              `
            }
          >
            {/* Render the icon dynamically from the navLinks array */}
            {({ isActive }) => (
              <>
                <link.icon
                  size={18}
                  // active icon is white, inactive is gray
                  className={isActive ? 'text-white' : 'text-gray-400'}
                />
                {link.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* DIVIDER */}
      <div className="border-t border-zinc-700 mx-4 my-4" />

      {/* PLAYLISTS SECTION */}
      {/* Shows all user playlists in the sidebar for quick access */}
      <div className="flex flex-col flex-1 overflow-hidden px-2">

        {/* Section header */}
        <p className="
          text-xs font-semibold
          text-gray-500
          uppercase tracking-widest
          px-4 mb-2
        ">
          Playlists
        </p>

        {/* Scrollable playlist list */}
        {/* overflow-y-auto → scroll if playlists overflow */}
        {/* flex-1 → takes remaining space below nav links */}
        <div className="overflow-y-auto flex-1">
          {playlists.length === 0 ? (

            // Empty state — no playlists yet
            <p className="text-gray-600 text-xs px-4">
              No playlists yet
            </p>

          ) : (

            // Map over playlists and render each as a link
            playlists.map((playlist) => (
              <NavLink
                key={playlist.id}
                to={`/playlists/${playlist.id}`}
                // dynamic route — each playlist has its own page
                className={({ isActive }) =>
                  `
                    flex items-center gap-2
                    px-4 py-2
                    rounded-lg
                    text-sm
                    truncate
                    transition-colors duration-150
                    ${isActive
                      ? 'text-white bg-zinc-700'
                      : 'text-gray-400 hover:text-white hover:bg-zinc-800'
                    }
                  `
                }
              >
                {/* Small colored dot before playlist name */}
                <span className="w-2 h-2 rounded-full bg-gray-500 shrink-0" />
                {/* shrink-0 → dot never shrinks even if name is long */}

                {/* truncate → long playlist names get ... */}
                <span className="truncate">{playlist.name}</span>
              </NavLink>
            ))
          )}
        </div>

      </div>

    </aside>
  )
}

export default Sidebar