import React from 'react';
import styles from './styles/selectInput.module.css';
import Select from 'react-select';

type SelectOption = {
  value: string;
  label: string;
} | null;

type SelectInputProps = {
  name: string;
  width?: number;
  label?: string;
  placeholder?: string;
  error?: string;
  value?: SelectOption;
  labelSibling?: React.ReactElement;
  options: SelectOption[];
  style?: React.CSSProperties;
  onChange?: (option: SelectOption) => void;
};

const BORDER_COLOR = '#cfcfcf';
const BORDER_FOCUS_COLOR = 'hsl(0, 0%, 70%)';
const PLACEHOLDER_COLOR = '#cfcfcf';

function SelectInput(props: SelectInputProps) {
  const {
    name,
    width = 'auto',
    label,
    placeholder,
    error,
    value,
    labelSibling,
    options,
    style,
    onChange,
  } = props;

  const containerStyles = { width, ...style };
  return (
    <div className={styles.selectInput} style={containerStyles}>
      <label>
        {label !== '' && label !== undefined ? (
          <div className={styles.label}>
            <div>{label}</div>
            {labelSibling}
          </div>
        ) : null}
        <Select<SelectOption>
          styles={{
            container: (baseStyles) => ({
              ...baseStyles,
              width: '100%',
            }),
            control: (baseStyles, state) => ({
              ...baseStyles,
              minHeight: 30,
              fontSize: 16,
              lineHeight: 'normal',
              boxShadow: 'none',
              borderColor: state.isFocused ? BORDER_FOCUS_COLOR : BORDER_COLOR,
              '&:hover': {
                borderColor: BORDER_FOCUS_COLOR,
              },
            }),
            valueContainer: (baseStyles) => ({
              ...baseStyles,
              padding: '7px 8px',
            }),
            placeholder: (baseStyles) => ({
              ...baseStyles,
              lineHeight: 'normal',
              color: PLACEHOLDER_COLOR,
            }),
            indicatorSeparator: (baseStyles) => ({
              ...baseStyles,
              margin: 0,
            }),
            dropdownIndicator: (baseStyles) => ({
              ...baseStyles,
              padding: 7,
            }),
            input: (baseStyles) => ({
              ...baseStyles,
              padding: 0,
              margin: 0,
            }),
          }}
          name={name}
          placeholder={placeholder}
          value={value}
          options={options}
          onChange={onChange}
        />
        {Boolean(error) ? (
          <div className={styles.inputError}>{error}</div>
        ) : null}
      </label>
    </div>
  );
}

export { SelectInput };
export type { SelectOption };
