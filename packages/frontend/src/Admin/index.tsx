import React, { useEffect, useState } from 'react';
import HeartZones from './HeartZones';
import Map from './Map';
import requestor from '../utils/requestor';

const AdminDashboard = () => {
  const [constants, setConstants] = useState({
    findSimilarStartDistance: {
      START_DISTANCE_CONSTRAINT: 0.0001,
    },
  });
  useEffect(() => {
    requestor.get('/admin/get-constants').then((res) => res.json()).then((json) => {
      setConstants(json);
    });
  }, []);

  return (
    <div>
      <HeartZones />
      <Map
        startDistanceConstraint={constants?.findSimilarStartDistance?.START_DISTANCE_CONSTRAINT}
      />
    </div>
  );
};

export default AdminDashboard;
