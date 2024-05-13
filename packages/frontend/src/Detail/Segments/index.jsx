import React, { useCallback, useState } from 'react';
import SegmentsChart from './SegmentsChart';

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
  const setAllVisible = useCallback(() => {
    setVisible(Array.from(segments).fill(true));
  }, []);
  const setAllHidden = useCallback(() => {
    setVisible(Array.from(segments).fill(false));
  }, []);
  const setToggleVisibility = useCallback(() => {
    setShowToggles((show) => !show);
  }, []);
  return (
    <div>
      <h2>Segments</h2>
      <div>
        <div>
          <button onClick={setAllVisible}>Show All</button>
          <button onClick={setAllHidden}>Hide All</button>
          <button onClick={setToggleVisibility}>Show Toggles</button>
        </div>
      </div>
      {showToggles && segments.map((seg, ix) => (
        <div key={seg.id}>
          <label>
            <input type="checkbox" value={ix} checked={visible[ix]} onChange={onToggle}/> {seg.name}
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
