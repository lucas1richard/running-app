import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import { hrZonesBg } from '../colors/hrZones';

dayjs.extend(utc)

const ZonesHeader = ({ zones, start }) => (
  <div>
    <h2 className="text-center">
      Zones Established: {dayjs(start).utc().format('MMMM DD, YYYY') }
    </h2>
    <div style={{ border: '1px solid black' }}>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '20%', padding: '1rem', background: hrZonesBg[1] }}>
          <div className="text-center">
            <b>Zone 1</b> ({zones.z1} - {zones.z2 - 1})
          </div>
        </div>
        <div style={{ width: '20%', padding: '1rem', background: hrZonesBg[2] }}>
          <div className="text-center">
            <b>Zone 2</b> ({zones.z2} - {zones.z3 - 1})
          </div>
        </div>
        <div style={{ width: '20%', padding: '1rem', background: hrZonesBg[3] }}>
          <div className="text-center">
            <b>Zone 3</b> ({zones.z3} - {zones.z4 - 1})
          </div>
        </div>
        <div style={{ width: '20%', padding: '1rem', background: hrZonesBg[4] }}>
          <div className="text-center">
            <b>Zone 4</b> ({zones.z4} - {zones.z5 - 1})
          </div>
        </div>
        <div style={{ width: '20%', padding: '1rem', background: hrZonesBg[5] }}>
          <div className="text-center">
            <b>Zone 5</b> (>={zones.z5})
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ZonesHeader;
