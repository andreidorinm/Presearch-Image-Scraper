require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const rateLimit = require("express-rate-limit");
const path = require('path');
const Bottleneck = require('bottleneck'); // Add this line

async function downloadImage(query, basePath) {
  try {
    const response = await axios.get(`https://api.presearch.org/search?engine=images&format=json&limit=1&q=${query}&stats=true`, {
      headers: {
        Authorization: `Bearer ${process.env.PRESEARCH_API_KEY}`
      }
    });

    const results = response.data.results;
    if (results.length > 0) {
      let url = results[0].url;

      // Check if the URL has an unsupported protocol
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        console.warn(`Unsupported protocol for query: ${query}`);
        return;
      }

      // Remove any URL parameters
      url = url.split('?')[0];

      // Extract the file extension from the image URL
      const ext = path.extname(url);

      // Create the output filename using the basePath and the extracted extension
      const filename = `${basePath}${ext}`;

      const writer = fs.createWriteStream(filename);
      const responseStream = await axios.get(url, {
        responseType: 'stream'
      });
      responseStream.data.pipe(writer);
      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    } else {
      console.warn(`No images found for query: ${query}`);
    }
  } catch (error) {
    console.error(`Error downloading image for query: ${query}`, error);
  }
}

async function downloadImages(data) {
  // Create a new limiter instance
  const limiter = new Bottleneck({
    minTime: 60000 / 4, // 4 requests per minute
  });

  for (const item of data) {
    const basePath = `images/${item['Nr.']}`;
    const query = `${item['Nume Produs']} glasses eyewear`;

    // Schedule the downloadImage function using the limiter
    await limiter.schedule(() => downloadImage(query, basePath));
  }
}

module.exports = downloadImages;
