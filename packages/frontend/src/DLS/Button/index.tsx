import styled from 'styled-components';
import standardProps, { type StandardProps } from '../utils/standardProps';

interface ButtonProps extends StandardProps {}

const Button = styled.button<ButtonProps>`
  padding: ${(props) => props.theme.getStandardUnit(0.5)};
  border: 1px solid black;
  background-color: azure;
  border-radius: ${(props) => props.theme.getStandardUnit(0.5)};
  font-weight: bolder;
  cursor: pointer;

  ${standardProps}
`;

export default Button;
