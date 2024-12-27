import styled from 'styled-components';
import standardProps, { type StandardProps } from '../utils/standardProps';

interface StandardBase<GenElement> extends Omit<React.HTMLAttributes<GenElement>, 'color'>, StandardProps {}

export const Div = styled.div<StandardBase<HTMLDivElement>>`
  ${standardProps}
`;

export const Span = styled.span<StandardBase<HTMLSpanElement>>`
  ${standardProps}
`;

export const Input = styled.input<StandardBase<HTMLInputElement>>`
  ${standardProps}
`;

export const Select = styled.select<StandardBase<HTMLSelectElement>>`
  ${standardProps}
`;
