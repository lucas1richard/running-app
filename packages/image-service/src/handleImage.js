const path = require('path');
const fs = require('fs');
const downloadImage = require('./downloadImage');
const { googleAPIKey } = require('./constants');

  /**
   * Handle image generation and storage
   * @param {string} activityId - The id of the activity
   * @param {string} routePath - The path of the route
   * @param {string} size - The size of the image
   * @param {string} maptype - The type of map
   */
const handleImage = async (activityId, routePath, size  = '900x450', maptype = 'roadmap') => {
  if (!activityId || !routePath) {
    throw new Error('activityId and routePath are required');
  }
  
  const file = `${activityId}.png`; // the activityId is the file name, and file type is png

  const rootDir = path.join(__dirname, 'static', size, maptype);

  fs.mkdirSync(rootDir, { recursive: true });
  console.log(`https://maps.googleapis.com/maps/api/staticmap?size=${size}&maptype=${maptype}&path=${routePath}&key=${googleAPIKey}`);
  await downloadImage(
    `https://maps.googleapis.com/maps/api/staticmap?size=${size}&maptype=${maptype}&path=${routePath}&key=${googleAPIKey}`,
    path.join(__dirname, 'static', size, maptype, file)
  )
};

module.exports = handleImage;
