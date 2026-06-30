import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ─── CONFIGURATION ──────────────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const ENV_PATH = path.join(ROOT_DIR, '.env');
const FILM_DATA_PATH = path.join(ROOT_DIR, 'src/lib/filmData.ts');

// Simple .env parser
function loadEnv() {
  if (!fs.existsSync(ENV_PATH)) return {};
  const content = fs.readFileSync(ENV_PATH, 'utf8');
  return Object.fromEntries(
    content.split('\n')
      .filter(line => line.includes('=') && !line.startsWith('#'))
      .map(line => {
        const [key, ...val] = line.split('=');
        return [key.trim(), val.join('=').trim()];
      })
  );
}

const env = loadEnv();
const API_KEY = env.YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY;
const PLAYLIST_ID = env.YOUTUBE_PLAYLIST_ID || process.env.YOUTUBE_PLAYLIST_ID;

if (!API_KEY || !PLAYLIST_ID) {
  console.error('❌ ERROR: YOUTUBE_API_KEY and YOUTUBE_PLAYLIST_ID must be set in .env');
  process.exit(1);
}

// ─── YOUTUBE SYNC LOGIC ─────────────────────────────────────────────────────

async function fetchPlaylistItems() {
  console.log(`📡 Fetching items from playlist: ${PLAYLIST_ID}...`);
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${PLAYLIST_ID}&key=${API_KEY}`;
  
  const res = await fetch(url);
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return data.items.map(item => ({
    id: `yt-${item.contentDetails.videoId}`,
    title: item.snippet.title,
    description: item.snippet.description || 'No description provided.',
    category: 'Game Film', // Default category for sync
    subcategory: 'Highlights',
    videoUrl: `https://www.youtube.com/watch?v=${item.contentDetails.videoId}`,
    duration: '0:00', // YouTube API requires separate call for duration
    level: 'Advanced',
    tags: ['highlights', 'game-film'],
  }));
}

async function sync() {
  try {
    const newFilms = await fetchPlaylistItems();
    console.log(`✅ Fetched ${newFilms.length} videos.`);

    const originalContent = fs.readFileSync(FILM_DATA_PATH, 'utf8');
    
    // Simple replacement strategy: find the start and end of the films array
    // Note: This assumes the array is at the end or uniquely identifiable.
    // For a more robust approach, we'd use a parser, but a regex works for this specific file structure.
    
    const startMarker = 'export const films: FilmEntry[] = [';
    const endMarker = '];';
    
    const startIndex = originalContent.indexOf(startMarker);
    const lastIndex = originalContent.lastIndexOf(endMarker);

    if (startIndex === -1) {
      throw new Error('Could not find films array in filmData.ts');
    }

    const header = originalContent.substring(0, startIndex + startMarker.length);
    const footer = originalContent.substring(lastIndex);
    
    const filmsJson = JSON.stringify(newFilms, null, 2)
      .replace(/"([^"]+)":/g, '$1:') // Remove quotes from keys
      .slice(1, -1); // Remove outer brackets [ ]

    const newContent = `${header}\n  /* --- AUTO-SYNCED FROM YOUTUBE --- */\n${filmsJson}\n${footer}`;

    fs.writeFileSync(FILM_DATA_PATH, newContent, 'utf8');
    console.log('🚀 filmData.ts updated successfully!');

  } catch (err) {
    console.error('❌ Sync failed:', err.message);
  }
}

sync();
