import styled from "@emotion/styled";
import type { ButtonHTMLAttributes } from "react";

import { Button } from "./Button";

const IconButtonButton = styled(Button)`
  width: 46px;
  height: 46px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

export const IconButton = ({
  name,
  ...buttonProps
}: { name: string } & ButtonHTMLAttributes<HTMLButtonElement>) => (
  <IconButtonButton {...buttonProps}>
    <span className="material-icons">{name}</span>
  </IconButtonButton>
);
