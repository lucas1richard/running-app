import CumulativeByRun from './CumulativeByRun';
import VolumeTable from './VolumeTable';

const Volume = () => {
  return (
    <div>
      <div>
        <CumulativeByRun />
      </div>
      <div className="flex">
        <div>
          <VolumeTable timeGroup="week" />
        </div>
        <div>
          <VolumeTable timeGroup="month" />
        </div>
      </div>
    </div>
  );
};

export default Volume;
