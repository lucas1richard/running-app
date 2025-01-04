const getEdgeCoords = (coords: LatLng[]) => {
  const allLats = coords.map((coord) => coord[0]);
  const allLons = coords.map((coord) => coord[1]);

  const edgeCoords = {
    north: Math.max.apply(null, allLats),
    south: Math.min.apply(null, allLats),
    east: Math.max.apply(null, allLons),
    west: Math.min.apply(null, allLons),
  };

  return edgeCoords;
};

export default getEdgeCoords;

