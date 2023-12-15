import type { InputProps } from "../studio/types";
import { NumberInput } from "./NumberInput";

export const RangeInput = ({
  value,
  onChange,
  label,
  min,
  max,
  step,
}: InputProps<number> & {
  label: string;
  min: number;
  max: number;
  step: number;
}) => {
  return (
    <div>
      {label}
      <input
        type="range"
        onChange={(evt) => onChange(evt.target.valueAsNumber)}
        {...{ value, min, max, step }}
      />
      <NumberInput value={value} {...{ onChange, min, max, step }} />
    </div>
  );
};
