import styled from 'styled-components';
import makeStyledCssRule from '../Grid/utils/makeStyledCssRule';


const flexColumn = makeStyledCssRule('direction', 'flex-direction');
const flexColumnXl = makeStyledCssRule('directionXl', 'flex-direction');
const flexColumnLg = makeStyledCssRule('directionLg', 'flex-direction');
const flexColumnMd = makeStyledCssRule('directionMd', 'flex-direction');
const flexColumnSm = makeStyledCssRule('directionSm', 'flex-direction');
const flexColumnXs = makeStyledCssRule('directionXs', 'flex-direction');

const Flex = styled.div`
  display: flex;
  ${flexColumn}

  ${({ theme }) => theme.breakpoints.down('sm')} {
    ${flexColumnXs}
  }
  ${({ theme }) => theme.breakpoints.between('sm', 'md')} {
    ${flexColumnSm}
  }
  ${({ theme }) => theme.breakpoints.between('md', 'lg')} {
    ${flexColumnMd}
  }
  ${({ theme }) => theme.breakpoints.between('lg', 'xl')} {
    ${flexColumnLg}
  }
  ${({ theme }) => theme.breakpoints.up('xl')} {
    ${flexColumnXl}
  }
`;

export default Flex;
