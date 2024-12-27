import React, { KeyboardEventHandler, MouseEventHandler, useCallback } from 'react';
import usePreferenceControl from '../hooks/usePreferenceControl';
import type { PreferencesKeyPath } from '../reducers/preferences';
import { Basic, Button, Flex } from '../DLS';
import propSelector from '../utils/propSelector';

type PreferenceControlProps = {
  subject: string,
  /** keyPath should be length >= 2 */
  keyPath: PreferencesKeyPath,
  showSaveButton?: boolean,
  defaultValue?: boolean,
  saveConfig?: any & { activityId: string },
  children: React.ReactNode,
}

const PreferenceControl: React.FC<PreferenceControlProps> = ({
  subject = '',
  keyPath,
  showSaveButton = false,
  defaultValue = true,
  saveConfig,
  children,
}) => {
  const [preference, setPreference, savePreferences] = usePreferenceControl(keyPath, defaultValue);

  const onClick = useCallback<MouseEventHandler<HTMLDivElement>>(() => {
    setPreference(!preference);
  }, [setPreference, preference]);

  const onKeyPress = useCallback<KeyboardEventHandler<HTMLDivElement>>((e) => {
    if (e.key === 'Enter') {
      setPreference(!preference);
    }
  }, [setPreference, preference]);

  return (
    <div>
      <Flex justify="space-between">
        <Basic.Div
          fontSize="h3"
          flexGrow="1"
          pad={1}
          borderB="1px solid #dedede"
          role="button"
          tabIndex={0}
          onClick={onClick}
          onKeyUp={onKeyPress}
          title={`Click to ${preference ? 'Hide' : 'Show'} ${subject}`}
        >
          <span>{subject}</span> {preference ? <small>&#9660;</small> : <small>&#9658;</small>}
        </Basic.Div>
        {showSaveButton && (
          <Button
            onClick={() => savePreferences(saveConfig)}
            className="pad quiet-input"
          >
            Save Preferences
          </Button>
        )}
      </Flex>
      <Basic.Div display={propSelector({ none: !preference })}>
        {children}
      </Basic.Div>
    </div>
  );
}

export default PreferenceControl;
