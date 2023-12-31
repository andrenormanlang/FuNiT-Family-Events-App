import { Pagination as MuiPagination } from '@mui/material';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface PaginationProps {
  count: number;
}

const Pagination: React.FC<PaginationProps> = ({ count }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const page = Number(searchParams.get('page')) || 1;

  const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    searchParams.set('page', value.toString());
    navigate(`${location.pathname}?${searchParams.toString()}`);
  };

  return (
    <MuiPagination count={count} page={page} onChange={handleChange} />
  );
};

export default Pagination;