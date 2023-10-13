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
    <select value={value} onChange={(evt) => onChange(evt.target.value as T)}>
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
};
