import { useCallback, useMemo } from 'react';
import { emptyArray } from '../constants';
import RouteMap from '../Detail/RouteMap';
import { useAppSelector } from '../hooks/redux';
import { selectStreamTypeData } from '../reducers/activities';
import DetailDataFetcher from '../Detail/DetailDataFetcher';
import getEdgeCoords from './getEdgeCoords';
import roundToNearest from '../utils/roundToNearest';

const id = 13152121307;
const degToRad = (deg: number) => deg * Math.PI / 180;

const Map = ({ startDistanceConstraint, compressionLevel }) => {
  const latlngStream = useAppSelector((state) => selectStreamTypeData(state, id, 'latlng'));
  const coordsPure = useMemo(() => {
    if (!latlngStream) return emptyArray;
    return latlngStream.map(([lat, lon]) => ({ lon, lat }));
  }, [latlngStream]);

  const coordsAtAngle = useCallback((coords: { lat: number, lon: number }, deg: number) => ({
    lat: coords.lat + startDistanceConstraint * Math.sin(degToRad(deg)),
    lon: coords.lon + startDistanceConstraint * Math.cos(degToRad(deg)),
  }), [startDistanceConstraint]);

  const vertGridData = [];
  const horiGridData = [];
  if (coordsPure[0]) {

    const edgeCoords = getEdgeCoords(latlngStream);
    const leftMostCoord = roundToNearest(edgeCoords.west, compressionLevel);
    const rightMostCoord = roundToNearest(edgeCoords.east, compressionLevel);
    const topMostCoord = roundToNearest(edgeCoords.north, compressionLevel);
    const bottomMostCoord = roundToNearest(edgeCoords.south, compressionLevel);

    for (let i = -1; leftMostCoord + i * compressionLevel <= rightMostCoord + compressionLevel; i++) {
      const coords = [
        [leftMostCoord + i * compressionLevel, topMostCoord + compressionLevel],
        [leftMostCoord + i * compressionLevel, bottomMostCoord - compressionLevel],
      ];
      vertGridData.push({
        geometry: {
          type: 'LineString',
          coordinates: coords,
        },
      });
    }

    for (let i = -1; bottomMostCoord + i * compressionLevel <= topMostCoord + compressionLevel; i++) {
      const coords = [
        [leftMostCoord - compressionLevel, bottomMostCoord + i * compressionLevel],
        [rightMostCoord + compressionLevel, bottomMostCoord + i * compressionLevel],
      ];
      horiGridData.push({
        geometry: {
          type: 'LineString',
          coordinates: coords,
        },
      });
    }
  }
  return (
    <div>
      <DetailDataFetcher id={id} />
      {coordsPure[0] && (
        <RouteMap
          id={id}
          segments={[
            [0, 1, 10000]
          ]}
          pointer={1000}
          height={1500}
          width={1500}
          averageSpeed={1}
          smoothAverageWindow={20}
          pins={emptyArray}
          velocity={[100]}
          series={[
            {
              type: 'mapline',
              id: 'grid-left',
              data: [...vertGridData, ...horiGridData],
            },
            {
              type: 'mappoint',
              id: 'start',
              name: 'start',
              tooltip: {
                // @ts-ignore
                enabled: false,
                format: '',
              },
              data: new Array(72).fill(0).map((_, i) => coordsAtAngle(coordsPure[0], i * 5)),
              marker: {
                symbol: 'circle',
                radius: 2,
              },
              animation: false,
            },
          ]}
        />
      )}
    </div>
  );
};

export default Map;
