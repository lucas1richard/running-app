// find by similar route
// - distance
// - start location
// - max/min values
//  - altitude
//  - 
//  - lat,long

const Router = require('express').Router;
const {
  getAllActivities,
  getAllStreams,
  getActivity,
} = require('../../database/setupdb-couchbase');

const router = new Router();

router.post('/by-route', async (req, res) => {
  const { body } = req;
  const id = body?.id; // id of the sample workout
  
  const activity = await getActivity(id);

  if (!id) {
    return res.json({ activity_not_found: true });
  }
  
  const allActivities = await getAllActivities();
  const allRuns = allActivities.filter(({ sport_type }) => sport_type === 'Run')
  const allStreams = await getAllStreams();

  const similarDistance = allRuns.filter(({ distance }) => Math.abs(distance - activity.distance) < 500);

  const getLatLongSimilar = (latlng) => (
    Math.abs((activity.start_latlng[0] - latlng[0]) * 100000) < 20
    && Math.abs((activity.start_latlng[1] - latlng[1]) * 100000) < 20
  );
  
  const similarStart = allRuns.filter(({ start_latlng }) => getLatLongSimilar(start_latlng));

  const getMap = (srcArr) => Object.fromEntries(srcArr.map((activity) => [activity.id, activity]))

  const base = getMap(similarDistance);
  const comparisons = [getMap(similarStart)];
  const combo = Object.keys(base)
    .filter((key) => key !== id && comparisons.every((dist) => Boolean(dist[id])))
    .map((key) => base[key]);

  res.json({ allRuns, similarDistance, similarStart, allStreams, combo });
});

module.exports = {
  similarWorkoutsRouter: router,
};
