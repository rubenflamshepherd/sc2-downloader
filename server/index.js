import express from 'express';
import cors from 'cors';
import ffmpeg from 'fluent-ffmpeg';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

const app = express();
const PORT = 3001;

app.use(cors());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Proxy audio for playback (handles CORS and missing files gracefully)
app.get('/api/audio', async (req, res) => {
  const { url } = req.query;

  console.log('Audio proxy request, URL:', url);

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    console.log('Fetching:', url);
    const response = await fetch(url);
    console.log('Response status:', response.status);

    if (!response.ok) {
      console.log('Audio not found, status:', response.status);
      return res.status(404).json({ error: 'Audio not found' });
    }

    res.setHeader('Content-Type', 'audio/ogg');
    res.setHeader('Accept-Ranges', 'bytes');

    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error('Audio proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Download and convert audio
app.get('/api/download', async (req, res) => {
  const { url, filename } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    console.log(`Downloading: ${url}`);

    // Fetch the OGG file from the wiki
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Set response headers for download
    const outputFilename = filename || 'audio.mp3';
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${outputFilename}"`);

    // Convert OGG to MP3 using ffmpeg
    const readable = Readable.from(buffer);

    ffmpeg(readable)
      .inputFormat('ogg')
      .audioCodec('libmp3lame')
      .audioBitrate(192)
      .format('mp3')
      .on('error', (err) => {
        console.error('FFmpeg error:', err.message);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Conversion failed: ' + err.message });
        }
      })
      .on('end', () => {
        console.log(`Conversion complete: ${outputFilename}`);
      })
      .pipe(res, { end: true });

  } catch (error) {
    console.error('Download error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('');
  console.log('Make sure ffmpeg is installed:');
  console.log('  macOS: brew install ffmpeg');
  console.log('  Ubuntu: sudo apt install ffmpeg');
  console.log('');
});
