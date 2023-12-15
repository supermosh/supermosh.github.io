import styled from "@emotion/styled";

const SelectSelect = styled.select`
  border: none;
  border-radius: 0;
  cursor: pointer;
  height: 46px;
  padding: 0.5em 1em;
`;

export const Select = <T extends string>({
  options,
  value,
  onChange,
}: {
  options: T[];
  value: T;
  onChange: (newValue: T) => any;
}) => {
  return (
    <SelectSelect
      value={value}
      onChange={(evt) => onChange(evt.target.value as T)}
    >
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </SelectSelect>
  );
};
