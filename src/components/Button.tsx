import { css } from "@emotion/react";
import styled from "@emotion/styled";

const ButtonStyles = css`
  font: inherit;
  border: 1px solid white;
  background-color: transparent;
  padding: 0.5em 1em;
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  &:disabled {
    color: white;
    opacity: 0.5;
    cursor: not-allowed;
  }
  &:not(:disabled):hover {
    cursor: pointer;
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

export const Button = styled.button`
  ${ButtonStyles}
`;

export const LinkButton = styled.a`
  ${ButtonStyles}
`;
