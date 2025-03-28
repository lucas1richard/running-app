import React, { useCallback, useEffect, useState } from 'react';
import SegmentsChart from './SegmentsChart';
import { Button } from '../../DLS';

const SegmentsDetailDisplay = ({ segments, heartData, velocityData }) => {
  const [visible, setVisible] = useState(Array.from(segments).fill(true));
  const [showToggles, setShowToggles] = useState(false);

  const onToggle = useCallback((ev) => {
    const ix = Number(ev.target.value);
    setVisible((visible) => {
      const newVisible = [...visible];
      newVisible[ix] = !newVisible[ix];
      return newVisible;
    })
  }, []);

  useEffect(() => {
    setVisible(Array.from(segments).fill(true));
  }, [segments]);

  const setAllVisible = useCallback(() => {
    setVisible(Array.from(segments).fill(true));
  }, [segments]);

  const setAllHidden = useCallback(() => {
    setVisible(Array.from(segments).fill(false));
  }, [segments]);

  const setToggleVisibility = useCallback(() => {
    setShowToggles((show) => !show);
  }, []);

  return (
    <div>
      <div>
        <div>
          <Button onClick={setAllVisible}>Show All</Button>
          <Button onClick={setAllHidden}>Hide All</Button>
          <Button onClick={setToggleVisibility}>Show Toggles</Button>
        </div>
      </div>
      {showToggles && segments.map((seg, ix) => (
        <div key={seg.id}>
          <label>
            <input type="checkbox" value={ix} checked={visible[ix]} onChange={onToggle} />
            &nbsp;
            {seg.name}
            &nbsp;
            <small>(index {seg.start_index} to {seg.end_index})</small>
          </label>
        </div>)
      )}
      <SegmentsChart
        heartData={heartData}
        velocity={velocityData}
        segments={segments.filter((el, ix) => visible[ix])}
      />
    </div>
  );
};

export default SegmentsDetailDisplay;
