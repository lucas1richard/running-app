import styled from 'styled-components';
import standardProps, { type StandardProps } from '../utils/standardProps';

interface StandardBase<GenElement> extends Omit<React.HTMLAttributes<GenElement>, 'color'>, StandardProps {}
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, Keys>> & {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
  }[Keys]


// don't allow Basics to be used without at least one standard prop
type RequiredStandardBase<GenElement> = RequireAtLeastOne<StandardBase<GenElement>, keyof StandardProps>

export const Div = styled.div<RequiredStandardBase<HTMLDivElement>>`
  ${standardProps}
`;

export const Span = styled.span<RequiredStandardBase<HTMLSpanElement>>`
  ${standardProps}
`;

export const Input = styled.input<RequiredStandardBase<HTMLInputElement>>`
  ${standardProps}
`;

export const Select = styled.select<RequiredStandardBase<HTMLSelectElement>>`
  ${standardProps}
`;
