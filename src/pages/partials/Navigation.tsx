import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Container, useMediaQuery, Box, IconButton, Drawer, List, ListItem, ListItemButton } from '@mui/material';
import { styled, useTheme } from '@mui/system';
import MenuIcon from '@mui/icons-material/Menu';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    marginBottom: theme.spacing(2),
  },
}));

const Navbar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { signedInUser, signOutUser } = useAuth();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  // const {
	// 	// signedInUser,
	// 	// signedInUserDoc,
	// 	// signedInUserEmail,
	// 	// signedInUserName,
	// 	// signedInUserPhotoUrl
	// } = useAuth()

  const handleLogout = async () => {
    await signOutUser();
    navigate('/');
  };


  return (
    <StyledAppBar position="static">
      <Container maxWidth="lg">
        <Toolbar>
          <NavLink to="/" style={{ color: 'inherit', textDecoration: 'none', flexGrow: 1 }}>
            <Typography variant="h6" component="div">
              FunniT
            </Typography>
          </NavLink>
          <Box display={isMobile ? 'none' : 'block'}>
            <Button color="inherit" component={NavLink} to="/">Home</Button>
            <Button color="inherit">About</Button>
            {signedInUser ? (
              <>
                <Button color="inherit" onClick={handleLogout}>Logout</Button>
                <Button color="inherit" component={NavLink} to="/event-form">Tip Us!</Button>
              </>
            ) : (
              <>
                <Button color="inherit" component={NavLink} to="/login">Login</Button>
                <Button color="inherit" component={NavLink} to="/register">Register</Button>
              </>
            )}
          </Box>
          <Box display={isMobile ? 'block' : 'none'}>
            <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
      >
        <List>
          <ListItem>
            <ListItemButton onClick={handleDrawerToggle}>
              <Button color="inherit">Home</Button>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton onClick={handleDrawerToggle}>
              <Button color="inherit">About</Button>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton component={NavLink} to="/register" onClick={handleDrawerToggle}>
              <Button color="inherit">Register</Button>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton component={NavLink} to="/event-form" onClick={handleDrawerToggle}>
              <Button color="inherit">Tip Us!</Button>
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </StyledAppBar>
  );
};

export default Navbar;