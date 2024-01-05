import React, { useState } from 'react';
import { TextField, IconButton, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchComponentProps {
    onSearch: (searchTerm: string, isDateSearch?: boolean) => void;
    placeholder?: string;
}

const Search: React.FC<SearchComponentProps> = ({ onSearch, placeholder = 'Search...' }) => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isDateSearch, setIsDateSearch] = useState<boolean>(false);

    const handleSearchClick = () => {
        onSearch(searchTerm, isDateSearch);
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleSearchClick();
        }
    };

    const toggleSearchType = () => {
        setIsDateSearch(!isDateSearch);
        setSearchTerm('');
    };

    return (
        <div>
            <TextField
                type={isDateSearch ? 'date' : 'text'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={placeholder}
                variant="outlined"
                size="small"
            />
            <IconButton onClick={handleSearchClick}>
                <SearchIcon />
            </IconButton>
            <Button onClick={toggleSearchType}>
                {isDateSearch ? 'General Search' : 'Date Search'}
            </Button>
        </div>
    );
};

export default Search;