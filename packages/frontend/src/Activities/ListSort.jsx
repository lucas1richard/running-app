import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectListPrerences } from '../reducers/preferences';
import { triggerSetUserPrefs } from '../reducers/preferences-actions';

const setPrefAction = (payload) => ({ type: 'preferencesReducer/SET_LIST_PREFERENCES', payload });

const ListSort = ({}) => {
  const dispatch = useDispatch();
  const listPreferences = useSelector(selectListPrerences);
  const savePreferences = () => dispatch(triggerSetUserPrefs(undefined));

  return (
    <div>
      <div className="flex flex-justify-between">
        <div>
          <label>
            <input
              type="checkbox"
              id="group-by-zones"
              name="group-by-zones"
              checked={listPreferences.isGroupByZonesSet}
              onChange={() => dispatch(setPrefAction({ isGroupByZonesSet: !listPreferences.isGroupByZonesSet }))}
            />
            Group by Heart Rate Zones
          </label>
        </div>
        <div>
          <label>
            Sort by:
            <select
              value={listPreferences.sortBy}
              onChange={(ev) => dispatch(setPrefAction({ sortBy: ev.target.value }))}
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
              onChange={() => dispatch(setPrefAction({ sortOrder: 'asc' }))}
            />
            Ascending
          </label>
          <label>
            <input
              type="radio"
              name="sort-order"
              value="desc"
              checked={listPreferences.sortOrder === 'desc'}
              onChange={() => dispatch(setPrefAction({ sortOrder: 'desc' }))}
            />
            Descending
          </label>
        </div>
      </div>
      <div>
        <label htmlFor="tile-background-select">
          Tile Background:
        </label>
        <select
          id="tile-background-select"
          className="quiet-input"
          value={listPreferences.tileBackgroundIndicator}
          onChange={(ev) => dispatch(setPrefAction({ tileBackgroundIndicator: ev.target.value }))}
        >
          <option value="weather">Weather</option>
          <option value="elevation">Elevation</option>
          <option value="none">None</option>
        </select>
      </div>
      <div>
        <button onClick={savePreferences}>Save Preferences</button>
      </div>
    </div>
  );
}

export default ListSort;
