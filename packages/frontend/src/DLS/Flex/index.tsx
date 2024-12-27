import styled from 'styled-components';
import makeSizeProps, { type SizeProp } from '../utils/makeSizeProps';
import type { CSS } from 'styled-components/dist/types';
import standardProps, { StandardProps } from '../utils/standardProps';

interface FlexProps extends StandardProps
  , SizeProp<'direction', CSS.Property.FlexDirection>
  , SizeProp<'alignItems', CSS.Property.AlignItems>
  , SizeProp<'justify', CSS.Property.JustifyContent>
  , SizeProp<'wrap', CSS.Property.FlexWrap>
  , SizeProp<'gap', number | CSS.Property.Gap>
  {}

const Flex = styled.div<FlexProps>`
  display: flex;
  ${standardProps}
  ${makeSizeProps(
    [
      ['direction', 'flex-direction'],
      ['alignItems', 'align-items'],
      ['justify', 'justify-content'],
      ['wrap', 'flex-wrap'],
      ['gap', 'gap'],
    ]
  )}
`;

export default Flex;
