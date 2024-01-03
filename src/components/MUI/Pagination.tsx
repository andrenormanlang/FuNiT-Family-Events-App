import { Pagination as MuiPagination } from '@mui/material';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface PaginationProps {
  count: number;
  onPageChange: (page: number) => void; // Add this line
}

const Pagination: React.FC<PaginationProps> = ({ count, onPageChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const page = Number(searchParams.get('page')) || 1;

  const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    searchParams.set('page', value.toString());
    navigate(`${location.pathname}?${searchParams.toString()}`);
    onPageChange(value); // Call the callback function
  };

  return (
    <MuiPagination count={count} page={page} onChange={handleChange} />
  );
};

export default Pagination;