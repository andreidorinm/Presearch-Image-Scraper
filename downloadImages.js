require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const rateLimit = require("express-rate-limit");
const path = require('path');

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

function createRateLimiter() {
  // limit requests to 4 per minute without stats and 4 per hour with stats
  const limiter = rateLimit({
    windowMs: 60000, // 1 minute
    max: 4, // limit each IP to 4 requests per windowMs
    skipSuccessfulRequests: true, // skip counting successful requests
    keyGenerator: function (req, res) {
      // key by IP address and query params
      return req.ip + req.query.engine + req.query.format + req.query.limit + req.query.stats + req.query.q;
    },
  });

  return limiter;
}

async function downloadImages(data) {
  const limiter = createRateLimiter();

  for (const item of data) {
    const basePath = `images/${item['Nr.']}`;
    const query = `${item['Nume Produs']} glasses eyewear`;

    // Wrap the downloadImage function with a Promise
    const limitedDownloadImage = () => new Promise((resolve, reject) => {
      limiter(() => {
        downloadImage(query, basePath)
          .then(resolve)
          .catch(reject);
      });
    });

    await limitedDownloadImage();
  }
}

module.exports = downloadImages;
