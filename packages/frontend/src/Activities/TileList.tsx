import React, { memo, useMemo, useState } from 'react';
import { Basic, Button, Flex } from '../DLS';
import ActivityTile from './ActivityTile';
import { useAppSelector } from '../hooks/redux';
import { selectListActivities } from '../reducers/activities';

type TileListProps = {
  showHideFunction: boolean;
  tileBackgroundIndicator: string;
};

const TileList: React.FC<TileListProps> = ({ showHideFunction, tileBackgroundIndicator }) => {
  const [showAllActivities, setShowAllActivities] = useState(false);
  const runs = useAppSelector((state) => selectListActivities(state, 0, undefined));

  const displayActivities = useMemo(() => showAllActivities ? runs : runs.slice(0, 10), [runs, showAllActivities]);

  return (
    <div>
      <div>
        {/* {
          activitiesApiStatus === success && (
            // categorizeRunsByZones.map(({ runs, zones, start }) => (
            //   <Flex $direction="column" $gap={1} key={start}>
            //     {isGroupByZonesSet && (
            //       <Basic.Div
            //         $marginT={3}
            //         $marginB={1}
            //         $position='sticky'
            //         $top={0}
            //         $zIndex={1}
            //         $colorBg='white'
            //       >
            //         <ZonesHeader zones={zones} start={start} />
            //       </Basic.Div>
            //     )} */}
                <div className="flex flex-column gap-4">
                  {displayActivities.map((activity) => (
                    <ActivityTile
                      key={activity.id}
                      activity={activity}
                      className="card"
                      backgroundIndicator={tileBackgroundIndicator}
                      showHideFunction={showHideFunction}
                    />
                  ))}
                </div>
              {/* // </Flex>
            ))
          )
        } */}
      </div>
      <Button $width="100%" onClick={() => setShowAllActivities(true)}>Show All</Button>
    </div>
  )
};

export default memo(TileList);
