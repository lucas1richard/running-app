import Surface from '@/DLS/Surface';
import ActivityTypesDisplay from '@/TopNav/ActivityTypesDisplay';

const TopNav = () => (
  <Surface variant="foreground">
    <div className="text-body">
      <ActivityTypesDisplay />
      {/* <RecentlyVisitedActivities /> */}
    </div>
  </Surface>
);

export default TopNav;
