import styled from "@emotion/styled";
import { ButtonHTMLAttributes } from "react";

const IconButtonButton = styled.button`
  width: 46px;
  height: 46px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const IconButton = ({
  name,
  ...buttonProps
}: { name: string } & ButtonHTMLAttributes<HTMLButtonElement>) => (
  <IconButtonButton {...buttonProps}>
    <span className="material-icons">{name}</span>
  </IconButtonButton>
);
