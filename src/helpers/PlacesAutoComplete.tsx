// import usePlacesAutocomplete from 'use-places-autocomplete';
// import { TextField, List, ListItem, CircularProgress } from '@mui/material';

// interface FieldProps {
//   name: string;
//   value: string;
//   onChange: (value: string) => void;
// }

// interface Props {
//     field:  FieldProps;
//     error: boolean;
//     helperText: string | undefined;
// }

// interface Suggestion {
//     description: string;
//   }

// interface ComponentState {
//     status: string;
//     isLoading: boolean;
//   }

//   const PlacesAutocomplete: React.FC<Props & { selectedCity: string }> = ({ field, selectedCity, error, helperText }) => {
//     const copenhagenCenter = new google.maps.LatLng(55.6761, 12.5683);
//   const malmoCenter = new google.maps.LatLng(55.604981, 13.003822);
//   const radius = 30000; // Radius in meters (e.g., 30 kilometers)

//   const requestOptions = {
//     requestOptions: {
//       location: selectedCity === 'Copenhagen' ? copenhagenCenter : malmoCenter,
//       radius: radius,
//       types: ["address"], // Optional: to get only address suggestions
//     },
//   };
//   const {
//     ready,
//     value,
//     suggestions: { status, data },
//     setValue,
//     clearSuggestions,
//   } = usePlacesAutocomplete( requestOptions);

//   const state: ComponentState = {
//     status: ["OK", "FAIL", "LOADING"].includes(status) ? status : "LOADING",
//     isLoading: ready === false,
//   };

//   const handleInput = (e: { target: { value: string; }; }) => {
//     setValue(e.target.value);
//   };

//   const handleSelect = ({ description }: Suggestion) => async () => {
//     setValue(description, false);
//     clearSuggestions();
//     field.onChange(description);

//   };

//   return (
//     <div>
//       <TextField
//         {...field}
//         value={value}
//         onChange={handleInput}
//         error={error}
//         helperText={helperText || 'Start typing to search for an address'}
//         fullWidth
//         margin="normal"
//         disabled={!ready}
//       />
//       {status === 'OK' && (
//         <List>
//           {data.map((suggestion) => (
//             <ListItem button key={suggestion.place_id} onClick={handleSelect(suggestion)}>
//               {suggestion.description}
//             </ListItem>
//           ))}
//         </List>
//       )}
//       {state.isLoading && <CircularProgress />}
//     </div>
//   );
// };

// export default PlacesAutocomplete;

import usePlacesAutocomplete from 'use-places-autocomplete';
import { TextField, List, ListItem, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';

interface Props {
    value: string;
    onChange: (value: string) => void;
    error: boolean;
    helperText: string | undefined;
    selectedCity?: string; // Make selectedCity optional
}

interface Suggestion {
    description: string;
}

interface ComponentState {
    status: string;
    isLoading: boolean;
}

const PlacesAutocomplete: React.FC<Props & { value: string; onChange: (value: string) => void }> = ({
    onChange,
    error,
    helperText,
    selectedCity = 'DefaultCity'
}) => {
    const [requestOptions, setRequestOptions] = useState({});

    // const copenhagenBounds = new google.maps.LatLngBounds(
    //   new google.maps.LatLng(55.6154, 12.5242), // Southwest corner of Copenhagen
    //   new google.maps.LatLng(55.7271, 12.6738)  // Northeast corner of Copenhagen
    // );

    // const malmoBounds = new google.maps.LatLngBounds(
    //   new google.maps.LatLng(55.5655, 12.9260), // Southwest corner of Malmö
    //   new google.maps.LatLng(55.6256, 13.0763)  // Northeast corner of Malmö
    // );

    // const requestOptions = {
    //   requestOptions: {
    //     bounds: selectedCity === 'Copenhagen' ? copenhagenBounds : malmoBounds,
    //     // strictBounds: true,
    //     types: ['geocode'],
    //   },
    // };

    useEffect(() => {
        // Define the locationRestriction for the autocomplete
        const locationRestriction = {
            north: 55.7271,
            south: 55.5655,
            east: 13.0763,
            west: 12.5242
        };

        // Update requestOptions to use locationRestriction instead of bounds
        setRequestOptions({
            requestOptions: {
                locationRestriction,
                strictBounds: true, // Keep the strictBounds as you have it
                types: ['geocode', 'establishment'] // Continue to restrict to geocode type for addresses
            }
        });
    }, [selectedCity]);

    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions
    } = usePlacesAutocomplete(requestOptions);

    const state: ComponentState = {
        status: ['OK', 'FAIL', 'LOADING'].includes(status) ? status : 'LOADING',
        isLoading: ready === false
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(newValue);
        onChange(newValue); // Call the passed onChange function
    };

    const handleSelect =
        ({ description }: Suggestion) =>
        () => {
            setValue(description, false);
            clearSuggestions();
            onChange(description); // Call the passed onChange function
        };

    const filteredSuggestions = data.filter(
        (suggestion) => suggestion.description.includes('Copenhagen') || suggestion.description.includes('Malmö')
    );

    return (
        <div>
            <TextField
                value={value}
                onChange={handleInput}
                error={error}
                helperText={helperText || 'Start typing to search for an address in Copenhagen or Malmö'}
                fullWidth
                margin="normal"
                disabled={!ready}
            />
            {status === 'OK' && (
                <List>
                    {filteredSuggestions.map((suggestion) => (
                        <ListItem key={suggestion.place_id} onClick={handleSelect(suggestion)}>
                            {suggestion.description}
                        </ListItem>
                    ))}
                </List>
            )}
            {state.isLoading && <CircularProgress />}
        </div>
    );
};

export default PlacesAutocomplete;
