import { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';

const validateSrc = (src) => new Promise((resolve, reject) => {
  const img = new Image();
  img.src = src;
  img.addEventListener('load', () => resolve(true));
  img.addEventListener('error', () => resolve(false));
});

const GoogleMapImage = ({
  polyline,
  activityId,
  imgWidth,
  imgHeight,
  height = 100,
  width,
  ...rest
}) => {
  const src = `http://localhost:3002/routes/${activityId}.png?size=${imgWidth || 900}x${imgHeight || 450}&maptype=roadmap&path=enc:${polyline}`;

  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const onError = useCallback(() => {
    setIsError(true);
    setIsLoading(false);
  }, []);

  const onLoad = useCallback(() => {
    setIsError(false);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!polyline) {
      return onError();
    }
    validateSrc(src).then((isValid) => {
      if (isValid) onLoad();
      else onError();
    });
  }, [polyline, onError, onLoad, src]);
  
  return (
    <>
      <div
        className={classNames('img', { 'display-none': !isLoading && !isError })}
        style={{ maxWidth: width, height: Number(height), background: '#333' }}
      />
      {polyline && <img
        src={src}
        alt=""
        className={classNames('img', { 'display-none': isLoading || isError })}
        onError={onError}
        onLoad={onLoad}
        height={height}
        style={{ maxWidth: width }}
        {...rest}
      />}
    </>
  );
};

export default GoogleMapImage;
