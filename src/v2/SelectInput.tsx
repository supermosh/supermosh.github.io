import { InputProps } from "./types";

export const SelectInput = ({
  value,
  onChange,
  options,
}: InputProps<string> & { options: string[] }) => {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
};
