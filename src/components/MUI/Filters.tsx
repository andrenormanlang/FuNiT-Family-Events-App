import { FormControl, InputLabel, Select, MenuItem, Box, Button } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { Category, AgeGroup } from '../../types/Event.types'; // adjust import path as needed
import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../services/firebase';

export interface FilterChange {
    [key: string]: string | number | boolean; // adjust this as per your needs
}

interface FiltersProps {
    onChange: (newFilters: FilterChange) => void;
    onReset: () => void;
    filters: {
        category: Category;
        ageGroup: AgeGroup;
        selectedMonth: string;
    };
}

const fetchUniqueMonths = async (): Promise<string[]> => {
    const eventsQuery = query(collection(db, 'events'), orderBy('eventDateTime', 'asc'));
    const querySnapshot = await getDocs(eventsQuery);
    const monthSet = new Set<string>();

    querySnapshot.forEach((doc) => {
        const eventDate = doc.data().eventDateTime.toDate();
        // Convert the month number to a month name, e.g., 0 -> January
        const monthName = eventDate.toLocaleString('default', { month: 'long' });
        const monthYear = `${monthName}-${eventDate.getFullYear()}`;
        monthSet.add(monthYear);
    });

    return Array.from(monthSet);
};

const Filters: React.FC<FiltersProps> = ({ filters, onChange, onReset }) => {
    const [internalFilters, setInternalFilters] = useState({
        category: '',
        ageGroup: '',
        selectedMonth: ''
    });

    const handleFilterChange = (event: SelectChangeEvent) => {
        const { name, value } = event.target;
        if (name) {
            setInternalFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
        }
    };

    useEffect(() => {
        onChange(internalFilters);
    }, [internalFilters, onChange]);

    const [uniqueMonths, setUniqueMonths] = useState<string[]>([]);

    useEffect(() => {
        const loadMonths = async () => {
            const months = await fetchUniqueMonths();
            setUniqueMonths(months);
        };

        loadMonths();
    }, []);

    return (
        <Box sx={{ mb: 4, width: '100%', maxWidth: '1200px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', p: 2 }}>
            {/* Category Filter */}
            <FormControl fullWidth margin="normal">
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                    labelId="category-label"
                    name="category"
                    value={filters.category || Category.None}
                    onChange={handleFilterChange}
                    label="Category"
                >
                    <MenuItem value={Category.None}>
                        <em>None</em>
                    </MenuItem>
                    {Object.values(Category)
                        .filter((value) => value !== Category.None)
                        .map((category, index) => (
                            <MenuItem key={index} value={category}>
                                {category}
                            </MenuItem>
                        ))}
                </Select>
            </FormControl>

            {/* AgeGroup Filter */}
            <FormControl fullWidth margin="normal">
                <InputLabel id="ageGroup-label">Age Group</InputLabel>
                <Select
                    labelId="ageGroup-label"
                    name="ageGroup"
                    value={filters.ageGroup || AgeGroup.None}
                    onChange={handleFilterChange}
                    label="Age Group"
                >
                    <MenuItem value={AgeGroup.None}>
                        <em>None</em>
                    </MenuItem>
                    {Object.values(AgeGroup)
                        .filter((value) => value !== AgeGroup.None)
                        .map((ageGroup, index) => (
                            <MenuItem key={index} value={ageGroup}>
                                {ageGroup}
                            </MenuItem>
                        ))}
                </Select>
            </FormControl>

            {/* Month Filter */}
            <FormControl fullWidth margin="normal">
                <InputLabel id="month-label">Month</InputLabel>
                <Select labelId="month-label" name="selectedMonth" value={filters.selectedMonth} onChange={handleFilterChange} label="Month">
                    <MenuItem value="">
                        <em>All Months</em>
                    </MenuItem>
                    {uniqueMonths.map((month, index) => (
                        <MenuItem key={index} value={month}>
                            {month}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <Button variant="outlined" color="secondary" onClick={onReset} sx={{ mt: 2 }}>
                Reset Filters
            </Button>
        </Box>
    );
};

export default Filters;
