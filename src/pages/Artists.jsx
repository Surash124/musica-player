// Artists.jsx
// Shows all artists — just wraps ArtistList component
// The /artists route renders this page

import ArtistList from '../components/Artist/ArtistList'

function Artists() {
  // ArtistList handles everything — search, grid, empty state
  // This page is just a thin wrapper
  return <ArtistList />
}

export default Artists