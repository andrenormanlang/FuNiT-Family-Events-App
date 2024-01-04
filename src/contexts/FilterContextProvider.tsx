import { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of your context state
interface FilterState {
    categoryFilter: string;
    ageGroupFilter: string;
    cityFilter: string;
    selectedMonth: string;
}

// Create a context with a default value
const FilterContext = createContext<{
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}>({
    filters: {
        categoryFilter: '',
        ageGroupFilter: '',
        cityFilter: '',
        selectedMonth: '',
    },
    setFilters: () => {}, // empty function as a placeholder
});

export const useFilter = () => useContext(FilterContext);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
    const [filters, setFilters] = useState<FilterState>({
        categoryFilter: '',
        ageGroupFilter: '',
        cityFilter: '',
        selectedMonth: '',
    });

    return (
        <FilterContext.Provider value={{ filters, setFilters }}>
            {children}
        </FilterContext.Provider>
    );
};