import { Pagination as MuiPagination } from '@mui/material';
import React from 'react';

interface PaginationProps {
  count: number;
  page: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ count, page, onPageChange }) => {
  const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    onPageChange(value);
  };

  return (
    <MuiPagination count={count} page={page} onChange={handleChange} />
  );
};

export default Pagination;