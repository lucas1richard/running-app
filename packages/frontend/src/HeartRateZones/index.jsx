import React from 'react';
import AddZonesForm from './AddZonesForm';

const HeartRateZones = () => {
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
