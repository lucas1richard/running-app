import AddZonesForm from '@/HeartRateZones/AddZonesForm';
import { type FC } from 'react';

const HeartRateZones: FC = () => {
  return (
    <div>
      <h1>Heart Rate Zones</h1>
      <div>Current:</div>
      <div>
        <AddZonesForm />
      </div>
    </div>
  );
};

export default HeartRateZones;
