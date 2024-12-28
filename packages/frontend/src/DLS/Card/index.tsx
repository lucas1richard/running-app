import styled, { css } from 'styled-components';
import standardProps, { type StandardProps } from '../utils/standardProps';

interface StandardBase<GenElement> extends Omit<React.HTMLAttributes<GenElement>, 'color'>, StandardProps {}

export const cardCss = css`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.1);
`;

const CardWrapper = styled.div<StandardBase<HTMLDivElement>>`
  ${cardCss}
  ${standardProps}
`;

const Card: React.FC<StandardBase<HTMLDivElement>> = ({ children, ...rest }) => (
  <CardWrapper pad={1} borderRadius={0.5} {...rest}>
    {children}
  </CardWrapper>
)

export default Card;
