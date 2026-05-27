// musicStore.js
// Global state for the entire app
// Built with Zustand — a lightweight state management library
// Every component can read from and write to this store
// without passing props up and down through the component tree

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
// persist → automatically saves store to localStorage
// and reloads it when the app opens again
// without this, everything resets on page refresh

const useMusicStore = create(
  persist(
    // this function receives 'set' and 'get'
    // set → updates the store state
    // get → reads current store state (useful inside functions)
    (set, get) => ({

      // ─────────────────────────────────────────
      // PLAYER STATE
      // ─────────────────────────────────────────

      currentSong: null,
      // the full song object currently loaded in the player
      // null means nothing is playing yet

      isPlaying: false,
      // true → audio is playing
      // false → audio is paused or stopped

      queue: [],
      // array of song objects representing the play order
      // when you click play on a song list, that whole list
      // becomes the queue

      queueIndex: 0,
      // which position in the queue we're currently at
      // queue[queueIndex] === currentSong at all times

      isShuffled: false,
      // true → songs play in random order
      // false → songs play in queue order

      repeatMode: 'none',
      // 'none' → stop after last song
      // 'all'  → loop back to first song after last
      // 'one'  → repeat current song forever

      // ─────────────────────────────────────────
      // LIBRARY STATE
      // ─────────────────────────────────────────

      songs: [],
      // ALL songs loaded from the user's music folder
      // {
      //   id, title, artist, album, duration,
      //   coverArt, fileUrl, fileName, track, year
      // }

      artists: [],
      // derived from songs — unique artists
      // built automatically when songs are loaded
      // { name, coverArt, songCount }

      // ─────────────────────────────────────────
      // PLAYLISTS STATE
      // ─────────────────────────────────────────

      playlists: [],
      // array of playlist objects:
      // { id, name, songs[], createdAt }

      // ─────────────────────────────────────────
      // FAVOURITES STATE
      // ─────────────────────────────────────────

      favourites: [],
      // array of song IDs only — not full objects
      // e.g. ['abc123', 'def456']
      // when we need the full song we find it in songs array

      // ─────────────────────────────────────────
      // PLAYER ACTIONS
      // ─────────────────────────────────────────

      playSong: (song, songList = null) => {
        // song     → the song to play immediately
        // songList → optional: the full list this song came from
        //            becomes the new queue
        //            if null, just play this one song

        const queue = songList || [song]
        // if no list provided, queue is just this one song

        const queueIndex = queue.findIndex((s) => s.id === song.id)
        // findIndex → finds position of this song in the queue
        // so we know where we are and can skip forward/back

        set({ currentSong: song, isPlaying: true, queue, queueIndex })
      },

      setIsPlaying: (value) => {
        set({ isPlaying: value })
      },

      nextSong: () => {
        const { queue, queueIndex, isShuffled, repeatMode } = get()
        // get() reads current state — needed inside functions
        // because 'set' only writes, doesn't read

        if (queue.length === 0) return

        if (isShuffled) {
          // pick a random index different from current
          let randomIndex
          do {
            randomIndex = Math.floor(Math.random() * queue.length)
          } while (randomIndex === queueIndex && queue.length > 1)
          // do...while ensures we don't pick the same song again
          // unless there's only one song in the queue

          set({
            queueIndex: randomIndex,
            currentSong: queue[randomIndex],
            isPlaying: true,
          })
          return
        }

        const isLastSong = queueIndex === queue.length - 1

        if (isLastSong) {
          if (repeatMode === 'all') {
            // loop back to first song
            set({ queueIndex: 0, currentSong: queue[0], isPlaying: true })
          } else {
            // end of queue, stop playing
            set({ isPlaying: false })
          }
          return
        }

        // next → index goes UP by 1
        const nextIndex = queueIndex + 1
        set({
          queueIndex: nextIndex,
          currentSong: queue[nextIndex],
          isPlaying: true,
        })
      },

      previousSong: () => {
        const { queue, queueIndex } = get()

        if (queue.length === 0) return

        const isFirstSong = queueIndex === 0

        if (isFirstSong) {
          // at the start → wrap to last song
          const lastIndex = queue.length - 1
          set({
            queueIndex: lastIndex,
            currentSong: queue[lastIndex],
            isPlaying: true,
          })
          return
        }

        // previous → index goes DOWN by 1
        const prevIndex = queueIndex - 1
        set({
          queueIndex: prevIndex,
          currentSong: queue[prevIndex],
          isPlaying: true,
        })
      },

      toggleShuffle: () => {
        set((state) => ({ isShuffled: !state.isShuffled }))
        // state here is the current state
        // we flip isShuffled to its opposite
      },

      cycleRepeat: () => {
        const { repeatMode } = get()
        // cycle through: none → all → one → none → ...
        const next = {
          'none': 'all',
          'all': 'one',
          'one': 'none',
        }
        set({ repeatMode: next[repeatMode] })
      },

      // ─────────────────────────────────────────
      // LIBRARY ACTIONS
      // ─────────────────────────────────────────

      setSongs: (songs) => {
        // called by useLibrary hook after scanning music folder
        // also builds the artists list from the songs

        // Build artists array from songs
        // reduce → condenses an array into a single value
        // here we build a map of artist name → artist object
        const artistMap = songs.reduce((map, song) => {

          if (!map[song.artist]) {
            // first time we see this artist — create entry
            map[song.artist] = {
              name: song.artist,
              coverArt: song.coverArt,   // use first song's art
              songCount: 1,
            }
          } else {
            // artist already exists — just increment count
            map[song.artist].songCount += 1
          }

          return map
        }, {})
        // {} is the starting value of 'map'

        // Convert the map object into an array
        // Object.values() → [ artistObj, artistObj, ... ]
        const artists = Object.values(artistMap)

        // Sort artists alphabetically
        artists.sort((a, b) => a.name.localeCompare(b.name))

        set({ songs, artists })
      },

      updateSongDuration: (songId, duration) => {
        // updates duration of one song in the songs array
        // called by Player.jsx when audio metadata loads
        // jsmediatags doesn't provide duration so we get it
        // from the audio element instead — this saves it back
        // to the store so SongItem can display it in the list
        set((state) => ({
          songs: state.songs.map((s) =>
            s.id === songId
              ? { ...s, duration }  // update this song's duration
              : s                   // leave others unchanged
          )
        }))
      },

      // ─────────────────────────────────────────
      // PLAYLIST ACTIONS
      // ─────────────────────────────────────────

      createPlaylist: (name) => {
        const newPlaylist = {
          id: crypto.randomUUID(),
          // crypto.randomUUID() → generates a unique ID
          // built into modern browsers, no library needed
          name,
          songs: [],
          createdAt: Date.now(),
          // Date.now() → milliseconds since Jan 1 1970
        }

        set((state) => ({
          playlists: [...state.playlists, newPlaylist]
          // spread existing playlists + add new one
          // never mutate state directly in Zustand
        }))
      },

      addSongToPlaylist: (playlistId, song) => {
        set((state) => ({
          playlists: state.playlists.map((playlist) => {

            if (playlist.id !== playlistId) return playlist
            // not this one — return unchanged

            const alreadyAdded = playlist.songs.some((s) => s.id === song.id)
            if (alreadyAdded) return playlist
            // already there — don't add duplicate

            return {
              ...playlist,
              songs: [...playlist.songs, song]
            }
          })
        }))
      },

      removeSongFromPlaylist: (playlistId, songId) => {
        set((state) => ({
          playlists: state.playlists.map((playlist) => {
            if (playlist.id !== playlistId) return playlist

            return {
              ...playlist,
              songs: playlist.songs.filter((s) => s.id !== songId)
              // filter → keeps every song EXCEPT the one we're removing
            }
          })
        }))
      },

      deletePlaylist: (playlistId) => {
        set((state) => ({
          playlists: state.playlists.filter((p) => p.id !== playlistId)
        }))
      },

      renamePlaylist: (playlistId, newName) => {
        set((state) => ({
          playlists: state.playlists.map((playlist) => {
            if (playlist.id !== playlistId) return playlist
            return { ...playlist, name: newName }
          })
        }))
      },

      // ─────────────────────────────────────────
      // FAVOURITE ACTIONS
      // ─────────────────────────────────────────

      toggleFavourite: (songId) => {
        set((state) => {
          const isFavourited = state.favourites.includes(songId)
          // .includes() → true if songId is in the array

          if (isFavourited) {
            // already favourited → remove it
            return {
              favourites: state.favourites.filter((id) => id !== songId)
            }
          } else {
            // not favourited → add it
            return {
              favourites: [...state.favourites, songId]
            }
          }
        })
      },

    }),

    // ─────────────────────────────────────────
    // PERSIST CONFIG
    // ─────────────────────────────────────────
    {
      name: 'music-app-storage',
      // the key used in localStorage
      // open DevTools → Application → localStorage to see it

      partialize: (state) => ({
        // partialize → choose WHAT gets saved to localStorage

        playlists: state.playlists,     // ✓ save — user created these
        favourites: state.favourites,   // ✓ save — user curated these
        repeatMode: state.repeatMode,   // ✓ save — user preference
        isShuffled: state.isShuffled,   // ✓ save — user preference

        // songs → NOT saved — come from file system, blob URLs expire
        // currentSong → NOT saved — stale on next open
        // queue → NOT saved — rebuilt when songs load
      }),
    }
  )
)

export default useMusicStore