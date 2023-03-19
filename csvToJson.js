const fs = require('fs');
const Papa = require('papaparse');
require('dotenv').config(); // Add this line
const downloadImages = require('./downloadImages'); // Add this line


function parseCsvFile(file) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        delimiter: ";", // Update the delimiter to a semicolon
        skipEmptyLines: true,
        beforeFirstChunk: chunk => {
          // Remove the 'sep=;' row
          const rows = chunk.split('\n');
          if (rows[0].startsWith('sep=')) {
            rows.shift();
          }
          return rows.join('\n');
        },
        complete: results => {
          if (results.errors.length) {
            reject(results.errors);
          } else {
            resolve(results.data);
          }
        },
        error: error => {
          reject(error);
        }
      });
    });
  }

  function extractColumns(data) {
    return data.map(item => {
      return {
        'Nr.': item['Nr.'],
        'Nume Produs': item['Nume Produs'],
        'Pret Cu TVA': item['Pret Cu TVA'],
        'Moneda': item['Moneda']
      };
    }).filter(item => Object.values(item).some(value => value !== undefined));
  }
  

  async function main() {
    try {
      const csvContent = fs.readFileSync('incercare_csv.csv', 'utf-8');
      const parsedData = await parseCsvFile(csvContent);
      const extractedData = extractColumns(parsedData);
      const jsonContent = JSON.stringify(extractedData, null, 2);
      fs.writeFileSync('output.json', jsonContent);
      console.log('CSV data has been successfully converted to JSON format and saved as output.json');
  
      // Call the downloadImages function after generating the JSON data:
      await downloadImages(extractedData);
      console.log('Images downloaded successfully');
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  main();