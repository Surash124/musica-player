// App.jsx
// The root component of the entire app
// Responsibilities:
// 1. Sets up the overall layout (sidebar + main content + player)
// 2. Defines all routes — which URL shows which page
// 3. Wraps everything in the Router so navigation works

import { BrowserRouter, Routes, Route } from 'react-router-dom'
// BrowserRouter → enables URL-based navigation in React
//                 wraps the whole app so any component can use navigation
// Routes        → container for all your route definitions
// Route         → maps one URL pattern to one page component

import Sidebar from './components/Sidebar/Sidebar'
import Player from './components/Player/Player'

import Home from './pages/Home'
import Library from './pages/Library'
import Artists from './pages/Artists'
import ArtistDetail from './pages/ArtistDetail'
import Playlists from './pages/Playlists'
import PlaylistDetail from './pages/PlaylistDetail'
import Favourites from './pages/Favourites'

function App() {
  return (
    // BrowserRouter wraps everything
    // nothing outside it can use navigation hooks
    <BrowserRouter>

      {/* MAIN LAYOUT */}
      {/* min-h-screen → at least full viewport height */}
      {/* bg-zinc-900 → dark background for the whole app */}
      <div className="min-h-screen bg-zinc-900 flex">

        {/* SIDEBAR */}
        {/* fixed on the left — always visible on every page */}
        {/* width is w-56 (224px) defined inside Sidebar.jsx */}
        <Sidebar />

        {/* MAIN CONTENT AREA */}
        {/* ml-56 → pushes content right by sidebar width */}
        {/* mb-24 → pushes content up by player bar height */}
        {/* so content never hides behind sidebar or player */}
        {/* flex-1 → takes all remaining horizontal space */}
        {/* overflow-y-auto → this area scrolls, not the whole page */}
        <main className="
          ml-56
          mb-24
          flex-1
          overflow-y-auto
          min-h-screen
        ">

          {/* ROUTES */}
          {/* React Router reads the current URL */}
          {/* renders the matching page component */}
          {/* only ONE route renders at a time */}
          <Routes>

            <Route path="/" element={<Home />} />
            {/* / → Home page */}

            <Route path="/library" element={<Library />} />
            {/* /library → Library page */}

            <Route path="/artists" element={<Artists />} />
            {/* /artists → Artists grid page */}

            <Route path="/artists/:artistName" element={<ArtistDetail />} />
            {/* /artists/Queen → ArtistDetail page */}
            {/* :artistName → dynamic segment, any value works */}
            {/* ArtistDetail reads it with useParams() */}

            <Route path="/playlists" element={<Playlists />} />
            {/* /playlists → Playlists grid page */}

            <Route path="/playlists/:playlistId" element={<PlaylistDetail />} />
            {/* /playlists/abc-123 → PlaylistDetail page */}
            {/* :playlistId → dynamic segment */}

            <Route path="/favourites" element={<Favourites />} />
            {/* /favourites → Favourites page */}

            {/* CATCH ALL — 404 page */}
            {/* * matches any URL that didn't match above */}
            <Route path="*" element={<NotFound />} />

          </Routes>

        </main>

        {/* PLAYER BAR */}
        {/* fixed to bottom inside Player.jsx */}
        {/* lives here so it's always mounted */}
        {/* if it was inside a page it would unmount */}
        {/* when you navigate — audio would stop */}
        <Player />

      </div>

    </BrowserRouter>
  )
}

// Simple 404 component
// defined here because it's tiny and only used once
function NotFound() {
  return (
    <div className="
      flex flex-col items-center justify-center
      h-full gap-4 text-center
      min-h-screen
    ">
      <p className="text-6xl">404</p>
      <p className="text-gray-400">Page not found</p>
    </div>
  )
}

export default App