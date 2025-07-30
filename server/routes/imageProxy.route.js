import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Proxy endpoint to serve S3 images with proper CORS headers
router.get('/proxy-image', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Validate that it's an S3 URL from your bucket
    if (!url.includes('generic-uat.s3.eu-central-1.amazonaws.com')) {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    console.log('🖼️ Proxying image:', url);

    // Fetch the image from S3
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch image' });
    }

    // Set CORS headers
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': '*',
      'Content-Type': response.headers.get('content-type'),
      'Cache-Control': 'public, max-age=3600',
    });

    // Stream the image
    response.body.pipe(res);

  } catch (error) {
    console.error('❌ Image proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
