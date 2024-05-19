const GoogleMapImage = ({
  polyline,
  activityId,
  imgWidth,
  imgHeight,
  ...rest
}) => {
  if (!polyline) {
    return (<div style={{ width: Number(rest.width || 100) }} />)
  }
  return (
    <img
      src={`http://localhost:3002/routes/${activityId}.png?size=${imgWidth || 900}x${imgHeight || 450}&maptype=roadmap&path=enc:${polyline}`}
      alt=""
      {...rest}
    />
  );
};

export default GoogleMapImage;
