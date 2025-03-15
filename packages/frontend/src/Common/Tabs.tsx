import React, { useState, useId } from 'react';
import { Basic, Button } from '../DLS';

type TabProps = {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  isActive?: boolean;
};
export const Tab: React.FC<TabProps> = ({ children, onClick, isActive }) => (
  <Button
    role="button"
    tabIndex={0}
    $display="flex"
    $flexGrow="1"
    $flexShrink="1"
    $pad={1}
    $border="none"
    $colorBg={isActive ? 'silver' : 'white'}
    $flexJustify="center"
    $alignItems="center"
    onClick={onClick}
    $fontSize="h6"
  >
    {children}
  </Button>
);

type TabPanelProps = {
  isVisible?: boolean;
  children: React.ReactNode;
};
export const TabPanel: React.FC<TabPanelProps> = ({ isVisible, children }) => (
  <div className={`${!isVisible ? 'display-none' : ''}`}>
    {children}
  </div>
);

type TabContainerProps = {
  dynamicId?: string;
  children: React.ReactElement<TabPanelProps>[];
  activeTab?: number;
};
export const TabContainer: React.FC<TabContainerProps> = ({ dynamicId, children, activeTab }) => (
  <div id={dynamicId}>
    {React.Children.toArray(children).map(
      (child: React.ReactElement, ix) => React.cloneElement(child,
        {
          isVisible: ix === activeTab,
        }
      )
    )}
  </div>
);

type TabHeaderProps = {
  children: React.ReactElement<TabProps>[];
  onTabClick?: React.Dispatch<React.SetStateAction<number>>;
  activeTab?: number;
};
export const TabHeader: React.FC<TabHeaderProps> = ({ children, onTabClick, activeTab }) => (
  <Basic.Div $direction="column" $display="flex" $borderB="1px solid #dedede">
    {React.Children.toArray(children).map((child: React.ReactElement, ix) => {
      return (
        React.cloneElement(child, { onClick: () => onTabClick(ix), isActive: activeTab === ix })
      )
    })}
  </Basic.Div>
);

type TabsProps = {
  children: [React.ReactElement<TabHeaderProps>, React.ReactElement<TabContainerProps>];
};
const Tabs: React.FC<TabsProps> = ({ children }) => {
  const id = useId();
  const [active, setActive] = useState(0);
  return (
    <div>
      {React.cloneElement(children[0], { onTabClick: setActive, activeTab: active })}
      {React.cloneElement(children[1], { dynamicId: `${id}-panel-container`, activeTab: active })}
    </div>
  );
}

export default Tabs;

