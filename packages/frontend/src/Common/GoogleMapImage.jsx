import { GOOGLE_API_KEY } from '../constants';

const GoogleMapImage = ({ polyline, ...rest }) => (
  <img
    src={`https://maps.googleapis.com/maps/api/staticmap?size=600x300&maptype=roadmap&path=enc:${polyline}&key=${GOOGLE_API_KEY}`}
    alt=""
    {...rest}
  />
);

export default GoogleMapImage;
