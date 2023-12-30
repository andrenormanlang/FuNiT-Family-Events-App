import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';


interface Center {
    lat: number;
    lng: number;
}

const AddressMap = ({ center }: { center: Center }) => {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GEOCODE_API_KEY,
    });

    const containerStyle = {
        width: '100%',
        height: '400px',
    };

    if (loadError) return <div>Error loading maps</div>;
    if (!isLoaded) return <div>Loading maps...</div>;

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={15}
        >
            {center && <Marker position={center} />}
        </GoogleMap>
    );
};

export default AddressMap;