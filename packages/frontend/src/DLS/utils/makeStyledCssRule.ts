const makeStyledCssRule = (propName: string, cssProp: string) => (props: any) => props[propName]
  ? `${cssProp}: ${props[propName]};`
  : '';

export default makeStyledCssRule;
