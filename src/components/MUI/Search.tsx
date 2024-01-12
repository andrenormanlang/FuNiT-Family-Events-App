import { useState } from 'react';
import { TextField, IconButton, Switch, FormControlLabel, Tooltip, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useSearchParams } from 'react-router-dom';

interface SearchComponentProps {
    onSearch: (searchTerm: string, isDateSearch: boolean) => void;
    placeholder?: string;
}

const Search: React.FC<SearchComponentProps> = ({ onSearch }) => {
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || '');
    const [isDateSearch, setIsDateSearch] = useState(searchParams.get('dateSearch') === 'true');
    const [searchPerformed, setSearchPerformed] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearchClick = async () => {
        if (searchTerm.trim()) {
            // Check if searchTerm is not just empty spaces
            setIsSearching(true);
            await onSearch(searchTerm, isDateSearch);
            setSearchPerformed(true); // Only set to true if searchTerm is not empty
            setIsSearching(false);
        }
    };

    const handleRefreshClick = () => {
        setSearchTerm('');
        setSearchPerformed(false); // Make sure to reset this so the search icon is shown again
        onSearch('', isDateSearch);
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            handleSearchClick();
        }
    };

    const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsDateSearch(event.target.checked);
        // setSearchTerm('');
        // setSearchPerformed(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <FormControlLabel
                    sx={{
                        '& .MuiTypography-root': {
                            fontFamily: 'Sansita',
                            fontSize: '1.2rem',
                            fontWeight: '600' // replace 'Arial' with your desired font family
                        }
                    }}
                    control={<Switch checked={isDateSearch} onChange={handleToggle} />}
                    label={isDateSearch ? 'Date Search' : 'General Search'}
                />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '' }}>
                <TextField
                    type={isDateSearch ? 'date' : 'text'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={isDateSearch ? 'Search by date...' : 'Search events...'}
                    variant="outlined"
                    size="small"
                    style={{ marginRight: '8px' }}
                    InputProps={{
                        endAdornment: searchTerm && (
                            <IconButton onClick={() => setSearchTerm('')}>
                                <ClearIcon />
                            </IconButton>
                        )
                    }}
                />
                <Tooltip title={searchPerformed ? 'Refresh' : 'Search'}>
                    <span>
                        <IconButton onClick={searchPerformed ? handleRefreshClick : handleSearchClick} disabled={isSearching}>
                            {searchPerformed ? <RefreshIcon /> : <SearchIcon />}
                        </IconButton>
                    </span>
                </Tooltip>
            </Box>
        </div>
    );
};

export default Search;
