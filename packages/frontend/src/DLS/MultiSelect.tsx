import React, { useState } from 'react';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  selectedValues: string[];
  onChange: (selectedValues: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selectedValues,
  onChange,
  placeholder = 'Select options...',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleOption = (value: string) => {
    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    
    onChange(newSelectedValues);
  };

  const getSelectedLabels = () => {
    return options
      .filter(option => selectedValues.includes(option.value))
      .map(option => option.label)
      .join(', ');
  };

  return (
    <div className="multiselect">
      <div
        className={`multiselect-trigger ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span>
          {selectedValues.length > 0 ? getSelectedLabels() : placeholder}
        </span>
        <span className="arrow">{isOpen ? '▲' : '▼'}</span>
      </div>
      
      {isOpen && !disabled && (
        <div className="multiselect-dropdown">
          {options.map(option => (
            <button
              key={option.value}
              className={`multiselect-option ${
                selectedValues.includes(option.value) ? 'selected' : ''
              }`}
              onClick={() => handleToggleOption(option.value)}
            >
              <span className="text-emerald-600">{selectedValues.includes(option.value) ? '✓' : ''}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};