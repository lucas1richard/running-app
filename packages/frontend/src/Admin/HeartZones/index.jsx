import React from 'react';
import { useSelector } from 'react-redux';
import { selectAllHeartZones } from '../../reducers/heartzones';
import { getDateString } from '../../utils';
import styles from './HeartZones.module.css';
import AddNewHRZones from './AddNewZones';

const HeartZones = ({}) => {
  const allzones = useSelector(selectAllHeartZones);
  return (
    <div>
      <h2>Heart Zones</h2>
      <table className={styles.heartTable}>
        <thead className="text-center">
          <tr>
            <th>Zone 1</th>
            <th>Zone 2</th>
            <th>Zone 3</th>
            <th>Zone 4</th>
            <th>Zone 5</th>
            <th>Start Date</th>
          </tr>
        </thead>
        <tbody>
          {allzones.map((zone) => (
            <tr key={zone.id}>
              <td className="text-center">{zone.z1}</td>
              <td className="text-center">{zone.z2}</td>
              <td className="text-center">{zone.z3}</td>
              <td className="text-center">{zone.z4}</td>
              <td className="text-center">{zone.z5}</td>
              <td className="text-right">{getDateString(zone.start_date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <AddNewHRZones latestZone={allzones[0]} />
    </div>
  );
};

export default HeartZones;
