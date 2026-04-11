import makeSizeProps, { type SizeProp } from '@/DLS/utils/makeSizeProps';
import standardProps, { StandardProps } from '@/DLS/utils/standardProps';
import styled from 'styled-components';
import type { CSS } from 'styled-components/dist/types';

interface FlexProps extends StandardProps
  , SizeProp<'$direction', CSS.Property.FlexDirection>
  , SizeProp<'$alignItems', CSS.Property.AlignItems>
  , SizeProp<'$justify', CSS.Property.JustifyContent>
  , SizeProp<'$wrap', CSS.Property.FlexWrap>
  , SizeProp<'$gap', number | CSS.Property.Gap> { }

const Flex = styled.div<FlexProps>`
  display: flex;
  ${standardProps}
  ${makeSizeProps(
  [
    ['$direction', 'flex-direction'],
    ['$alignItems', 'align-items'],
    ['$justify', 'justify-content'],
    ['$wrap', 'flex-wrap'],
    ['$gap', 'gap'],
  ]
)}
`;

export default Flex;
