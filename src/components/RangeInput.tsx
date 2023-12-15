import styled from "@emotion/styled";

import type { InputProps } from "../studio/types";
import { NumberInput } from "./NumberInput";

const Hor = styled.div`
  display: flex;
  gap: 8px;
`;

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
    <Hor>
      <input
        type="range"
        onChange={(evt) => onChange(evt.target.valueAsNumber)}
        {...{ value, min, max, step }}
      />
      <NumberInput value={value} {...{ onChange, min, max, step }} />
      {label}
    </Hor>
  );
};
