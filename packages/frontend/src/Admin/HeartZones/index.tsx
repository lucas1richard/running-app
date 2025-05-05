import React from 'react';
import { useSelector } from 'react-redux';
import { selectAllHeartZones } from '../../reducers/heartzones';
import { getDateString } from '../../utils';
import styles from './HeartZones.module.css';
import AddNewHRZones from './AddNewZones';
import { Basic } from '../../DLS';
import Surface from '../../DLS/Surface';

const HeartZones: React.FC = () => {
  const allzones = useSelector(selectAllHeartZones);
  return (
    <>
      <Surface className="card pad">
        <Basic.Div $fontSize="h2" $marginB={1}>Heart Zones</Basic.Div>
        <table className={styles.heartTable}>
          <Basic.Thead $textAlign="center">
            <tr>
              <th>Zone 1</th>
              <th>Zone 2</th>
              <th>Zone 3</th>
              <th>Zone 4</th>
              <th>Zone 5</th>
              <th>Start Date</th>
            </tr>
          </Basic.Thead>
          <tbody>
            {allzones.map((zone) => (
              <Basic.Tr $textAlign="center" key={zone.id}>
                <td>{zone.z1}</td>
                <td>{zone.z2}</td>
                <td>{zone.z3}</td>
                <td>{zone.z4}</td>
                <td>{zone.z5}</td>
                <Basic.Td $textAlign="right">{getDateString(zone.start_date)}</Basic.Td>
              </Basic.Tr>
            ))}
          </tbody>
        </table>
      </Surface>
      <Basic.Div $marginT={1}>
        <AddNewHRZones latestZone={allzones[0]} />
      </Basic.Div>
    </>
  );
};

export default HeartZones;
