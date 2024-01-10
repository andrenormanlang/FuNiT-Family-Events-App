import { ListItemButton, Button, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';

interface CustomListItemButtonProps {
  to: string;
  text: string;
  onClick: () => void; 
}

const CustomListItemButton: React.FC<CustomListItemButtonProps> = ({ to, text, onClick }) => {
  return (
    <ListItemButton sx={{ justifyContent: 'center' }}>
      <Button color="inherit" component={NavLink} to={to} style={{ padding: 0 }} onClick={onClick}>
        <Typography variant="body2" gutterBottom sx={{ textTransform: 'uppercase', fontFamily: '"Sansita", sans-serif', fontSize: '1.4rem' }}>
          {text}
        </Typography>
      </Button>
    </ListItemButton>
  );
};

export default CustomListItemButton;