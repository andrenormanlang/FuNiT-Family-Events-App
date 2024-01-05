import React, { useState } from 'react';
import { TextField, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import algoliasearch from 'algoliasearch/lite';

// Initialize Algolia search client
const searchClient = algoliasearch(
  import.meta.env.VITE_ALGOLIA_APP_ID,
  import.meta.env.VITE_ALGOLIA_SEARCH_ONLY_API_KEY
);

// Replace 'your_index_name' with the name of the Algolia index you configured in the extension
const index = searchClient.initIndex('events_index');

interface SearchComponentProps {
    onSearch: (searchTerm: string) => void; // Use a more specific type instead of 'any' if possible
    placeholder?: string;
}


const Search = ({ onSearch, placeholder = 'Search...' }: SearchComponentProps): JSX.Element => {
    const [searchTerm, setSearchTerm] = useState('');
  
    const handleSearch = async () => {
      try {
        // Perform an Algolia search
        await index.search(searchTerm);
        // onSearch is now called with the searchTerm instead of hits
        onSearch(searchTerm); 
      } catch (error) {
        console.error('Error performing search:', error);
        // Handle the error appropriately
      }
    };
  
    const handleKeyPress = (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleSearch();
      }
    };
  
    return (
      <div>
        <TextField
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          variant="outlined"
          size="small"
        />
        <IconButton onClick={handleSearch}>
          <SearchIcon />
        </IconButton>
      </div>
    );
  };
  
  export default Search;