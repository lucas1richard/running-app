const https = require('https'); // or 'https' for https:// URLs
const fs = require('fs');

const downloadImage = (url, toFile) => new Promise((acc, rej) => {
  const file = fs.createWriteStream(toFile); // where to save the file, and its name
  https.get(url, function(response) {
    response.pipe(file);
  
    // after download completed close filestream
    file.on("finish", () => {
      file.close();
      console.log("Download Completed");
      acc();
    });

    file.on('error', (err) => {
      rej(err);
    });
  });
});

module.exports = downloadImage;
