import React from 'react';

interface Option {
  value: string | number;
  label: string;
}

interface FormSelectProps {
  label?: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const FormSelect: React.FC<FormSelectProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
  className = '',
}) => (
  <div className={`form-group ${className}`}>
    {label && <label htmlFor={name}>{label}</label>}
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className="form-select"
    >
      <option value="" disabled>Select...</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default FormSelect;
