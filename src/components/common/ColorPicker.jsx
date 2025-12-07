import React from 'react';
import { COLOR_OPTIONS } from '../../constants/colorOptions';

const ColorPicker = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-8 gap-3">
      {COLOR_OPTIONS.map((color) => (
        <div
          key={color.id}
          className={`color-option ${value?.toLowerCase() === color.name.toLowerCase() ? 'selected' : ''}`}
          onClick={() => onChange(color.name)}
        >
          <div
            className="color-swatch"
            style={{ 
              backgroundColor: color.hex,
              border: color.border ? '1px solid #d1d5db' : 'none',
            }}
          />
          <span className="color-label">{color.name}</span>
        </div>
      ))}
    </div>
  );
};

export default ColorPicker;
