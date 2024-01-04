import { Pagination as MuiPagination } from '@mui/material';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface PaginationProps {
    count: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ count, onPageChange }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const currentPage = Number(searchParams.get('page')) || 1;

    const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        // Update the page state by calling the onPageChange function from parent component
        onPageChange(value);

        // Update the URL search params
        searchParams.set('page', value.toString());
        navigate(`${location.pathname}?${searchParams.toString()}`);
    };

    return <MuiPagination count={count} page={currentPage} onChange={handleChange} />;
};

export default Pagination;
