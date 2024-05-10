import React, { useState, useEffect } from 'react';

const Activities = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/activities/list')
      .then((res) => res.json())
      .then(setActivities)
      .catch(console.log)
  }, []);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
      {activities.map((activity) => (
        <div key={activity.id} style={{ width: '20%', padding: '10px', border: '1px solid black' }}>
          <div>
            {activity.start_date_local}
          </div>
          <div>
            {activity.sport_type}
          </div>
          <div>
            Distance: {(activity.distance/1609).toFixed(2)} miles
          </div>
        </div>
      ))}
    </div>
  );
};

export default Activities;
