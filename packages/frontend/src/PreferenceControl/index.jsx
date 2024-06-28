import React, { useCallback } from 'react';
import usePreferenceControl from '../hooks/usePreferenceControl';

const PreferenceControl = ({
  subject = '',
  /** @type {[string, string, ...string[]]} keyPath should be length >= 2 */
  keyPath,
  showSaveButton = false,
  defaultValue = true,
  saveConfig, // { activityId: string }
  children,
}) => {
  const [preference, setPreference, savePreferences] = usePreferenceControl(keyPath, defaultValue);

  const onClick = useCallback(() => {
    setPreference(!preference);
  }, [setPreference, preference]);

  const onKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      setPreference(!preference);
    }
  }, [setPreference, preference]);

  return (
    <div>
      <div className="flex flex-justify-between">
        <div
          role="button"
          tabIndex={0}
          onClick={onClick}
          onKeyUp={onKeyPress}
          className="heading-3 flex-item-grow pad border-b"
          title={`Click to ${preference ? 'Hide' : 'Show'} ${subject}`}
        >
          <span>{subject}</span> {preference ? <small>&#9660;</small> : <small>&#9658;</small>}
        </div>
        {showSaveButton && (
          <button
            onClick={() => savePreferences(saveConfig)}
            className="pad quiet-input"
          >
            Save Preferences
          </button>
        )}
      </div>
        <div className={preference ? 'display-block' : 'display-none'}>
          {children}
        </div>
    </div>
  );
}

export default PreferenceControl;
