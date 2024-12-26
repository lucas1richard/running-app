import styled from 'styled-components';
import standardProps, { type StandardProps } from '../utils/standardProps';

interface StandardBase<GenElement> extends React.HTMLAttributes<GenElement>, StandardProps {}

export const Div = styled.div<StandardBase<HTMLDivElement>>`
  ${standardProps}
`;

export const Span = styled.span<StandardBase<HTMLSpanElement>>`
  ${standardProps}
`;
