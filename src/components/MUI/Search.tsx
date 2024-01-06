import React, { useEffect, useState } from 'react';
import { TextField, IconButton, Switch, FormControlLabel } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useSearchParams } from 'react-router-dom';

interface SearchComponentProps {
  onSearch: (searchTerm: string, isDateSearch: boolean) => void;
  placeholder?: string; // Add this line
}

const Search: React.FC<SearchComponentProps> = ({ onSearch }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearchTerm = searchParams.get('query') || '';
  const initialIsDateSearch = searchParams.get('dateSearch') === 'true';

  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm);
  const [isDateSearch, setIsDateSearch] = useState<boolean>(initialIsDateSearch);

  useEffect(() => {
    setSearchParams({ query: searchTerm, dateSearch: isDateSearch.toString() });
  }, [searchTerm, isDateSearch, setSearchParams]);

  const handleSearchClick = () => {
    onSearch(searchTerm, isDateSearch);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      handleSearchClick();
    }
  };

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsDateSearch(event.target.checked);
    setSearchTerm('');
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <FormControlLabel
        control={<Switch checked={isDateSearch} onChange={handleToggle} />}
        label={isDateSearch ? 'Date Search' : 'General Search'}
      />
      <TextField
        type={isDateSearch ? 'date' : 'text'}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder={isDateSearch ? 'Search by date...' : 'Search events...'}
        variant="outlined"
        size="small"
        style={{ margin: '0 8px' }}
      />
      <IconButton onClick={handleSearchClick}>
        <SearchIcon />
      </IconButton>
    </div>
  );
};

export default Search;