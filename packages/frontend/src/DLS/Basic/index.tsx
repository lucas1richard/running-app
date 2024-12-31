import styled from 'styled-components';
import standardProps, { type StandardProps } from '../utils/standardProps';

interface StandardBase<GenElement> extends Omit<React.HTMLAttributes<GenElement>, 'color'>, StandardProps { }
// type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = 
//   Pick<T, Exclude<keyof T, Keys>> & {
//     [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
//   }[Keys]


// don't allow Basics to be used without at least one standard prop
// type RequiredStandardBase<GenElement> = RequireAtLeastOne<StandardBase<GenElement>, keyof StandardProps>

export const Div = styled.div<StandardBase<HTMLDivElement>>`${standardProps}`;
export const Span = styled.span<StandardBase<HTMLSpanElement>>`${standardProps}`;

type InputShim<El = HTMLInputElement> = {
  onChange: React.ChangeEventHandler<El>
}
export const Input = styled.input<StandardBase<HTMLInputElement> & InputShim>`${standardProps}`;
export const Textarea = styled.input<StandardBase<HTMLTextAreaElement> & InputShim<HTMLTextAreaElement>>`${standardProps}`;
export const Select = styled.select<StandardBase<HTMLSelectElement>>`${standardProps}`;

export const Table = styled.table<StandardBase<HTMLTableElement>>`${standardProps}`;
export const Td = styled.td<StandardBase<HTMLTableCellElement>>`${standardProps}`;
export const Thead = styled.thead<StandardBase<HTMLTableSectionElement>>`${standardProps}`;
export const Tbody = styled.tbody<StandardBase<HTMLTableSectionElement>>`${standardProps}`;
export const Th = styled.th<StandardBase<HTMLTableCellElement>>`${standardProps}`;
export const Tr = styled.tr<StandardBase<HTMLTableRowElement>>`${standardProps}`;
