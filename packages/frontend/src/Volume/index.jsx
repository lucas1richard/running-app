import { Flex } from '../DLS';
import useViewSize from '../hooks/useViewSize';
import CumulativeByRun from './CumulativeByRun';
import VolumeTable from './VolumeTable';

const Volume = () => {
  const viewSize = useViewSize();
  return (
    <div>
      <div>
        <CumulativeByRun />
      </div>
      <Flex directionSmDown="column">
        <VolumeTable timeGroup="week" />
        {viewSize.gte('md') && (
          <VolumeTable timeGroup="month" />
        )}
      </Flex>
    </div>
  );
};

export default Volume;
