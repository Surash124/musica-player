// useLibrary.js
// Custom hook responsible for:
// 1. Opening the user's music folder via File System Access API
// 2. Scanning all audio files inside it
// 3. Reading metadata (title, artist, album, cover art) from each file
// 4. Building song objects and loading them into the store

import { useState } from 'react'
// Imported locally from node_modules after running 'npm i jsmediatags'
// No longer relying on the unstable, blocked CDN link in index.html
import jsmediatags from 'jsmediatags'

import useMusicStore from '../store/musicStore'

function useLibrary() {

  // Loading state — true while scanning files
  // used to show a loading spinner in the UI
  const [isLoading, setIsLoading] = useState(false)

  // Progress state — how many files processed so far
  // e.g. "Scanning 23 of 150 songs..."
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  // Error state — something went wrong
  const [error, setError] = useState(null)

  // Pull setSongs from the global store
  const { setSongs } = useMusicStore()

  // ─────────────────────────────────────────
  // OPEN FOLDER
  // ─────────────────────────────────────────

  const openFolder = async () => {
    // async → this function does things that take time
    // await → wait for the result before moving on

    try {
      setError(null)      // clear any previous error
      setIsLoading(true)  // show loading state

      // File System Access API
      // showDirectoryPicker() → opens the OS folder picker dialog
      // user selects their Music folder
      // returns a FileSystemDirectoryHandle — a reference to that folder
      const dirHandle = await window.showDirectoryPicker({
        mode: 'read',
        // mode: 'read' → we only need to read files, not write
        // this affects what permission the browser asks the user for
      })

      // Scan the folder and get all audio files
      const audioFiles = await scanFolder(dirHandle)

      if (audioFiles.length === 0) {
        setError('No audio files found in this folder')
        setIsLoading(false)
        return
      }

      // Set total for progress tracking
      setProgress({ current: 0, total: audioFiles.length })

      // Read metadata from every audio file
      const songs = await readAllMetadata(audioFiles)

      // Load songs into the global store
      setSongs(songs)

      setIsLoading(false)
      setProgress({ current: 0, total: 0 })

    } catch (err) {

      // User pressed Cancel on the folder picker
      // This throws an AbortError — not a real error, just cancellation
      if (err.name === 'AbortError') {
        setIsLoading(false)
        return
      }

      // Real error
      setError('Failed to open folder. Please try again.')
      setIsLoading(false)
      console.error('openFolder error:', err)
    }
  }

  // ─────────────────────────────────────────
  // SCAN FOLDER
  // ─────────────────────────────────────────

  const scanFolder = async (dirHandle) => {
    // Recursively walks through the folder
    // and collects all audio files including subfolders
    // e.g. Music/
    //        Rock/
    //          song1.mp3    ← finds this too
    //        song2.mp3

    const audioFiles = []

    // Supported audio formats
    const audioExtensions = ['.mp3', '.flac', '.wav', '.m4a', '.ogg', '.aac', '.mp4']

    // dirHandle.values() → async iterator over everything in the folder
    // for await...of → loops over async iterators
    for await (const entry of dirHandle.values()) {

      if (entry.kind === 'file') {
        // it's a file — check if it's an audio file

        const fileName = entry.name.toLowerCase()
        const isAudio = audioExtensions.some(ext => fileName.endsWith(ext))
        // .some() → true if ANY extension matches
        // .endsWith() → true if filename ends with that extension

        if (isAudio) {
          // getFile() → converts the FileSystemFileHandle into an actual File object
          // File object is what we can read bytes from
          const file = await entry.getFile()
          audioFiles.push(file)
        }

      } else if (entry.kind === 'directory') {
        // it's a subfolder — recursively scan it too
        const subFiles = await scanFolder(entry)
        // recursion → function calls itself with the subfolder
        audioFiles.push(...subFiles)
        // spread → adds all subFiles into audioFiles array
      }
    }

    return audioFiles
  }

  // ─────────────────────────────────────────
  // READ METADATA FROM ALL FILES
  // ─────────────────────────────────────────

  const readAllMetadata = async (files) => {
    const songs = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Update progress so UI can show "Scanning 23 of 150"
      setProgress({ current: i + 1, total: files.length })

      // Read metadata from this one file
      const song = await readMetadata(file)

      if (song) songs.push(song)
      // song is null if reading failed — skip it
    }

    return songs
  }

  // ─────────────────────────────────────────
  // READ METADATA FROM ONE FILE
  // ─────────────────────────────────────────

  const readMetadata = (file) => {
    // jsmediatags uses old-style callbacks instead of promises
    // we wrap it in a Promise so we can use await on it
    // resolve() → success, sends the song object back
    // we never reject() — on error we still resolve with basic info
    // so one bad file never blocks the rest from loading

    return new Promise((resolve) => {

      // Using the local npm instance of jsmediatags directly
      // .read() → reads ID3 tags from the File object
      jsmediatags.read(file, {

        onSuccess: async (tag) => {
          const { title, artist, album, picture, track, year } = tag.tags
          // tag.tags → the actual ID3 data
          // destructure what we need

          // ── COVER ART ──
          // picture.data → raw bytes of the image
          // picture.format → mime type e.g. 'image/jpeg'
          let coverArt = null
          if (picture) {
            const base64 = uint8ArrayToBase64(picture.data)
            coverArt = `data:${picture.format};base64,${base64}`
            // data URLs look like: data:image/jpeg;base64,/9j/4AAQ...
            // browsers understand these as images directly
          }

          // ── FILE URL ──
          // URL.createObjectURL() → creates a temporary URL for the file
          // looks like: blob:http://localhost:5173/abc-123-def
          // the audio element can play this URL directly
          // it only exists while this browser tab is open
          const fileUrl = URL.createObjectURL(file)

          // ── DURATION ──
          // jsmediatags doesn't provide duration
          // so we create a temporary Audio element, load the file,
          // read the duration from it, then discard it
          const duration = await getAudioDuration(file)

          // ── BUILD SONG OBJECT ──
          resolve({
            id: crypto.randomUUID(),
            // unique ID for this song in our app

            title: title || stripExtension(file.name),
            // use ID3 title if it exists
            // fallback to filename without extension

            artist: artist || 'Unknown Artist',

            album: album || 'Unknown Album',

            duration,
            // now comes from getAudioDuration instead of being 0

            coverArt,
            // the data URL string or null

            fileUrl,
            // the blob URL for audio playback

            fileName: file.name,
            // original filename, useful for debugging

            track: track || 0,
            year: year || null,
          })
        },

        onError: async () => {
          // metadata read failed — file might be corrupted
          // we still add the song using the filename as the title
          // so no song is silently lost
          const duration = await getAudioDuration(file)

          resolve({
            id: crypto.randomUUID(),
            title: stripExtension(file.name),
            artist: 'Unknown Artist',
            album: 'Unknown Album',
            duration,
            coverArt: null,
            fileUrl: URL.createObjectURL(file),
            fileName: file.name,
            track: 0,
            year: null,
          })
        }
      })
    })
  }

  // ─────────────────────────────────────────
  // HELPER — Get audio duration from file
  // ─────────────────────────────────────────

  const getAudioDuration = (file) => {
    // creates a temporary Audio element just to read the duration
    // onloadedmetadata fires when browser reads the audio header
    // we resolve with the duration then discard the element

    return new Promise((resolve) => {
      const audio = new Audio()
      const url = URL.createObjectURL(file)
      audio.src = url

      audio.onloadedmetadata = () => {
        resolve(audio.duration)
        URL.revokeObjectURL(url)
        // revokeObjectURL → frees memory
        // we no longer need this temporary URL
      }

      audio.onerror = () => {
        resolve(0)
        // if it fails just return 0
        URL.revokeObjectURL(url)
      }
    })
  }

  // ─────────────────────────────────────────
  // HELPER — Strip file extension from filename
  // ─────────────────────────────────────────

  const stripExtension = (fileName) => {
    return fileName
      .replace(/\.[^/.]+$/, '')   // remove extension → "song.mp3" → "song"
      .replace(/[_]/g, ' ')       // underscores → spaces
      .replace(/\(.*?\)/g, '')    // remove (360p) (lyrics) (official) etc
      .replace(/\[.*?\]/g, '')    // remove [HD] [Official Video] etc
      .trim()                     // remove leading/trailing spaces
  }

  // ─────────────────────────────────────────
  // HELPER — Convert Uint8Array to base64 string
  // ─────────────────────────────────────────

  const uint8ArrayToBase64 = (data) => {
    // Uint8Array → raw bytes e.g. [255, 216, 255, 224, ...]
    // Optimized block conversion to handle large embedded album artworks
    // without triggering maximum execution stack errors.
    let binary = ''
    const chunkSize = 8192
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.subarray(i, i + chunkSize)
      binary += String.fromCharCode.apply(null, chunk)
    }
    return btoa(binary)
  }

  // ─────────────────────────────────────────
  // RETURN — expose what components need
  // ─────────────────────────────────────────

  return {
    openFolder,   // call this when user clicks "Open Folder"
    isLoading,    // true while scanning
    progress,     // { current, total } for progress bar
    error,        // string or null
  }
}

export default useLibrary