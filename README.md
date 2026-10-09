# Spotify Clone — Your daily soundtrack

A responsive Spotify-inspired frontend built by **Saloni Pandey** with HTML, CSS and vanilla JavaScript. Explore a sample catalogue, save favourites, and play audio from your own device.

## Features

- Responsive sidebar, album grid, editorial hero and fixed player for desktop and mobile.
- Search by title or artist; filter songs, chart previews, imported audio and favourites.
- Like/unlike items with localStorage persistence and graceful fallback when storage is blocked.
- Import multiple local audio files; play/pause, previous/next, seek, volume, mute, shuffle, repeat and queue.
- Keyboard-accessible controls, labelled sliders, skip link, reduced-motion support and live status feedback.
- No build step, framework, external fonts or icon CDN required.

## Run locally

```bash
git clone https://github.com/salonipandey-dev/Spotify-clone-frontend-.git
cd Spotify-clone-frontend-
python -m http.server 8000
```

Open http://localhost:8000. VS Code Live Server also works. Select **Add your music**, choose audio files and select an imported card to play it. Supported formats depend on your browser; MP3 and WAV are good starting points.

## Keyboard controls

- `Tab`: move between controls; `Enter`: activate a focused button.
- `/`: focus search when not already interacting with a control.
- `Space`: toggle playback when focus is outside an interactive control.
- `Escape`: close the queue dialog.

## Project structure

- `index.html` — semantic layout and player controls
- `style.css` — responsive layout, theme and interaction states
- `script.js` — catalogue, search, local audio and favourites
- `picturs/` — original project artwork and icons

## Scope and privacy

This is an independent educational project, not an official Spotify product. Catalogue songs and charts are **visual previews only**; there is no Spotify API connection, streaming catalogue, authentication or premium subscription. Existing artwork is retained from the original project and belongs to its respective owners.

Imported audio uses browser object URLs and is not uploaded. Audio files must be reselected after reloading; favourites persist in the same browser where storage is available. Reimporting the same unchanged file restores its saved favourite. No audio files are distributed with this repository.

## Manual verification

1. Search for an artist, try a no-results query, and clear it.
2. Like a card, open Liked tracks, reload and verify it remains saved.
3. Import two audio files; verify playback, seek, pause, next/previous, volume, mute, shuffle, repeat and queue selection.
4. Try an unsupported file and verify the app gives useful feedback.
5. Check a narrow mobile viewport and keyboard-only navigation.

## Learning outcomes

CSS Grid/Flexbox, semantic HTML, responsive design, DOM rendering, event handling, the HTMLMediaElement API, localStorage and handling user-provided files safely with textContent.
