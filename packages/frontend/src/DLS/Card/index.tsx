import styled, { css } from 'styled-components';
import standardProps, { type StandardProps } from '../utils/standardProps';

interface StandardBase<GenElement> extends Omit<React.HTMLAttributes<GenElement>, 'color'>, StandardProps {}

export const cardCss = css`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.1);
  padding: 1rem;
`;

const Card = styled.div<StandardBase<HTMLDivElement>>`
  ${cardCss}
  ${standardProps}
`;

export default Card;
