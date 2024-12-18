import React from 'react';
import styled from 'styled-components';

const ViewSize = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 5px;
  font-size: 12px;

  ${props => props.theme.breakpoints.between('xs', 'sm')} {
    background-color: red;
    &::after {
      content: 'extra small';
    }
  }

  ${props => props.theme.breakpoints.between('sm', 'md')} {
    background-color: green;
    &::after {
      content: 'small';
    }
  }

  ${props => props.theme.breakpoints.between('md', 'lg')} {
    background-color: blue;
    &::after {
      content: 'medium';
    }
  }

  ${props => props.theme.breakpoints.between('lg', 'xl')} {
    background-color: #000000;
    &::after {
      content: 'large';
    }
  }

  ${props => props.theme.breakpoints.up('xl')} {
    background-color: #ff00dd;
    &::after {
      content: 'extra large';
    }
  }
`;

const ViewSizeDisplay = () => {
  return (
    <div>
      <ViewSize />
    </div>
  );
};

export default ViewSizeDisplay;
