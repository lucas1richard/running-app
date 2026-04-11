import classNames from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';

const validateSrc = (src) => new Promise((resolve, reject) => {
  const img = new Image();
  img.src = src;
  img.addEventListener('load', () => resolve(true));
  img.addEventListener('error', () => resolve(false));
});

type GoogleMapImageProps = {
  polyline: string;
  activityId: number;
  imgWidth?: number;
  imgHeight?: number;
  height?: number | string;
  width?: number | string;
  alt?: string;
};

export const getMapImageSrc = (activityId: number, polyline: string, imgWidth?: number, imgHeight?: number) => {
  return `http://localhost:3002/routes/${activityId}.png?size=${imgWidth || 900}x${imgHeight || 450}&maptype=roadmap&path=enc:${polyline}`;
};

const GoogleMapImage: React.FC<GoogleMapImageProps> = ({
  polyline,
  activityId,
  imgWidth,
  imgHeight,
  height = 'auto',
  width,
  ...rest
}) => {
  const src = getMapImageSrc(activityId, polyline, imgWidth, imgHeight);
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
        style={{ maxWidth: width, height, background: '#333' }}
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
