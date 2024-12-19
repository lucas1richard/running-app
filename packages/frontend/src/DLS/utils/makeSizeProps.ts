import { css } from 'styled-components';
import makeStyledCssRule from './makeStyledCssRule';

type PropsArg = [baseName: string, cssProp: string][];

const makeSizeProps = (propArg: PropsArg) => {
  return css`
    ${propArg.map(([baseName, cssRule]) => makeStyledCssRule(baseName, cssRule))}

    // Breakpoint only
    ${({ theme }) => theme.breakpoints.down('sm')} {
      ${propArg.map(([baseName, cssRule]) => makeStyledCssRule(`${baseName}Xs`, cssRule))}
    }
    ${({ theme }) => theme.breakpoints.between('sm', 'md')} {
      ${propArg.map(([baseName, cssRule]) => makeStyledCssRule(`${baseName}Sm`, cssRule))}
    }
    ${({ theme }) => theme.breakpoints.between('md', 'lg')} {
      ${propArg.map(([baseName, cssRule]) => makeStyledCssRule(`${baseName}Md`, cssRule))}
    }
    ${({ theme }) => theme.breakpoints.between('lg', 'xl')} {
      ${propArg.map(([baseName, cssRule]) => makeStyledCssRule(`${baseName}Lg`, cssRule))}
    }
    ${({ theme }) => theme.breakpoints.up('xl')} {
      ${propArg.map(([baseName, cssRule]) => makeStyledCssRule(`${baseName}Xl`, cssRule))}
    }

    // Breakpoint and below
    ${({ theme }) => theme.breakpoints.down('md')} {
      ${propArg.map(([baseName, cssRule]) => makeStyledCssRule(`${baseName}SmDown`, cssRule))}
    }
    ${({ theme }) => theme.breakpoints.down('lg')} {
      ${propArg.map(([baseName, cssRule]) => makeStyledCssRule(`${baseName}MdDown`, cssRule))}
    }
    ${({ theme }) => theme.breakpoints.down('xl')} {
      ${propArg.map(([baseName, cssRule]) => makeStyledCssRule(`${baseName}LgDown`, cssRule))}
    }

    // Breakpoint and above
    ${({ theme }) => theme.breakpoints.up('sm')} {
      ${propArg.map(([baseName, cssRule]) => makeStyledCssRule(`${baseName}SmUp`, cssRule))}
    }
    ${({ theme }) => theme.breakpoints.up('md')} {
      ${propArg.map(([baseName, cssRule]) => makeStyledCssRule(`${baseName}MdUp`, cssRule))}
    }
    ${({ theme }) => theme.breakpoints.up('lg')} {
      ${propArg.map(([baseName, cssRule]) => makeStyledCssRule(`${baseName}LgUp`, cssRule))}
    }
  `;
};

export type SizeProp<Base extends string, T> = Partial<
  Record<
    `${Base}`
    | `${Base}Xs`
    | `${Base}Sm`
    | `${Base}SmDown`
    | `${Base}SmUp`
    | `${Base}Md`
    | `${Base}MdDown`
    | `${Base}MdUp`
    | `${Base}Lg`
    | `${Base}LgDown`
    | `${Base}LgUp`
    | `${Base}Xl`, T
  >
>;

export default makeSizeProps;
