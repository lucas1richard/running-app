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
      <Flex directionSm="column" directionXs="column">
        <VolumeTable timeGroup="week" />
        {viewSize.gte('md') && (
          <div>
            <VolumeTable timeGroup="month" />
          </div>
        )}
      </Flex>
    </div>
  );
};

export default Volume;
