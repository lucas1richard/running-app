import React from 'react';
import Surface from '../DLS/Surface';
import ActivityTypesDisplay from './ActivityTypesDisplay';

const TopNav = () => (
  <Surface variant="foreground">
    <div className="text-body">
      <ActivityTypesDisplay />
      {/* <RecentlyVisitedActivities /> */}
    </div>
  </Surface>
);

export default TopNav;
