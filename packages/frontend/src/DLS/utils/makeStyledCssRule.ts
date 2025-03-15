const makeStyledCssRule = (propName: string, cssProp: number | string) => (props: any) => typeof props[propName] !== 'undefined'
  ? `${cssProp}: ${typeof props[propName] === 'number' ? props.theme.getStandardUnit(props[propName]) : props[propName]};`
  : '';

export const makeStyledThemeRule = (propName: string, cssProp: number | string, fallback: string) => (props: any) => typeof props?.[propName] !== 'undefined'
  ? `${cssProp}: ${props?.theme?.[propName]?.[props?.[propName] || fallback]};`
  : '';

export default makeStyledCssRule;
