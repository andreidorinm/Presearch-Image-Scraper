# Presearch-Image-Scraper
## This repository contains a script for scraping images using the Presearch API, based on JSON data.

## Prerequisites
✨ Before running the script, make sure you have the following:

 - Node.js (version 14 or higher)
 - A Presearch API key
 - Installation
✨ To install the dependencies, run:

```sh
npm install
```

## Usage
Put your JSON data in the data directory, with each item having a Nr. and a Nume Produs field.
Rename example.env to .env and replace YOUR_PRESEARCH_API_KEY with your actual API key.

✨ Run the script using:

```sh
npm start
```

✨ The images will be downloaded to the images directory.

## Rate Limiting
The script uses rate limiting to avoid overwhelming the Presearch API. Requests are limited to 4 per minute without stats and 4 per hour with stats.

## License
This project is licensed under the MIT License.
