import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { selectListPrerences } from '../reducers/preferences';
import { triggerSetUserPrefs } from '../reducers/preferences-actions';
import { useAppSelector } from '../hooks/redux';
import { Button, Flex } from '../DLS';

const setPrefAction = (payload: any) => ({ type: 'preferencesReducer/SET_LIST_PREFERENCES', payload });

const ListSort: React.FC = () => {
  const dispatch = useDispatch();
  const listPreferences = useAppSelector(selectListPrerences);
  const savePreferences = () => dispatch(triggerSetUserPrefs(undefined));
  const onGroupByZonesChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    () => dispatch(setPrefAction({ isGroupByZonesSet: !listPreferences.isGroupByZonesSet })),
    [dispatch, listPreferences.isGroupByZonesSet]
  );
  const onSortByFieldChange = useCallback<React.ChangeEventHandler<HTMLSelectElement>>(
    (ev) => dispatch(setPrefAction({ sortBy: ev.target.value })),
    [dispatch]
  );
  const setSortOrderAsc = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    () => dispatch(setPrefAction({ sortOrder: 'asc' })),
    [dispatch]
  );
  const setSortOrderDesc = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    () => dispatch(setPrefAction({ sortOrder: 'desc' })),
    [dispatch]
  );
  const onBackgroundChange = useCallback<React.ChangeEventHandler<HTMLSelectElement>>(
    (ev) => dispatch(setPrefAction({ tileBackgroundIndicator: ev.target.value })),
    [dispatch]
  );

  return (
    <div>
      <Flex $justify="space-between">
        <label>
          <input
            type="checkbox"
            id="group-by-zones"
            name="group-by-zones"
            checked={listPreferences.isGroupByZonesSet}
            onChange={onGroupByZonesChange}
          />
          Group by Heart Rate Zones
        </label>

        <div>
          <label>
            Sort by:
            <select
              value={listPreferences.sortBy}
              onChange={onSortByFieldChange}
              className="quiet-input"
            >
              <option value="start_date">Date</option>
              <option value="distance">Distance</option>
              <option value="total_elevation_gain">Elevation Gain</option>
              <option value="average_speed">Average Speed</option>
              <option value="max_speed">Max Speed</option>
              <option value="average_heartrate">Average Heart Rate</option>
              <option value="max_heartrate">Max Heart Rate</option>
              <option value="elapsed_time">Elapsed Time</option>
              <option value="name">Name</option>
            </select>
          </label>
          <label>
            <input
              type="radio"
              name="sort-order"
              value="asc"
              checked={listPreferences.sortOrder === 'asc'}
              onChange={setSortOrderAsc}
            />
            Ascending
          </label>
          <label>
            <input
              type="radio"
              name="sort-order"
              value="desc"
              checked={listPreferences.sortOrder === 'desc'}
              onChange={setSortOrderDesc}
            />
            Descending
          </label>
        </div>
      </Flex>
      <div>
        <label htmlFor="tile-background-select">
          Tile Background:
        </label>
        <select
          id="tile-background-select"
          className="quiet-input"
          value={listPreferences.tileBackgroundIndicator}
          onChange={onBackgroundChange}
        >
          <option value="weather">Weather</option>
          <option value="elevation">Elevation</option>
          <option value="none">None</option>
        </select>
      </div>
      <div>
        <Button onClick={savePreferences}>Save Preferences</Button>
      </div>
    </div>
  );
}

export default ListSort;
