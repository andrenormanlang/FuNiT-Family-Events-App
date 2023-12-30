import { CircularProgress } from '@mui/material';
import { GoogleMap, MarkerF, useLoadScript } from '@react-google-maps/api';
import marker from '../assets/images/mapmarker.svg';


interface Center {
  lat: number;
  lng: number;
}

interface Props {
  center: Center;
  icon?: string; 
}

const AddressMap = ({ center }: Props) => {
  const { isLoaded } = useLoadScript({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GEOCODE_API_KEY || '', 
  });

  const containerStyle = {
    width: '100%',
    height: '400px',
  };

  if (!isLoaded) return <CircularProgress />;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={15}
    >
      <MarkerF
        position={center}
        icon={{
            url: marker, 
            scaledSize: new window.google.maps.Size(32, 32), 
        }} 
      />
    </GoogleMap>
  );
};

export default AddressMap;