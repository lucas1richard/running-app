const handleImage = async (activityId, routePath, size  = '900x450', maptype = 'roadmap') => {
  if (!activityId || !routePath) {
    throw new Error('activityId and routePath are required');
  }
  
  const file = `${activityId}.png`; // the activityId is the file name, and file type is png

  const rootDir = path.join(__dirname, 'static', size, maptype);
  const options = {
    root: rootDir
  };

  fs.mkdirSync(rootDir, { recursive: true });
  console.log(`https://maps.googleapis.com/maps/api/staticmap?size=${size}&maptype=${maptype}&path=${routepath}&key=${googleAPIKey}`);
  await downloadImage(
    `https://maps.googleapis.com/maps/api/staticmap?size=${size}&maptype=${maptype}&path=${routepath}&key=${googleAPIKey}`,
    path.join(__dirname, 'static', size, maptype, file)
  )
};

module.exports = handleImage;
