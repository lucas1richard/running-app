import styled from 'styled-components';
import makeSizeProps, { type SizeProp } from '../utils/makeSizeProps';

interface FlexProps extends
  SizeProp<'direction', 'row' | 'column'>
  , SizeProp<'alignItems', 'flex-start' | 'center' | 'flex-end'>
  , SizeProp<'justify', 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around'>
  , SizeProp<'gap', string> {}

const Flex = styled.div<FlexProps>`
  display: flex;
  ${makeSizeProps(
    [
      ['direction', 'flex-direction'],
      ['alignItems', 'align-items'],
      ['justify', 'justify-content'],
      ['gap', 'gap'],
    ]
  )}
`;

export default Flex;
