import styled from 'styled-components';
import standardProps, { type StandardProps } from '../utils/standardProps';

interface ButtonProps extends StandardProps {}

const Button = styled.button<ButtonProps>`
  padding: 0.5rem;
  border: 1px solid black;
  background-color: azure;
  border-radius: 0.5rem;
  font-weight: bolder;
  cursor: pointer;

  ${standardProps}
`;

export default Button;
