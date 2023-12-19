import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Container, useMediaQuery, Box, IconButton, Drawer, List, ListItem, ListItemButton } from '@mui/material';
import { styled, useTheme } from '@mui/system';
import MenuIcon from '@mui/icons-material/Menu';
import { NavLink } from 'react-router-dom';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    marginBottom: theme.spacing(2),
  },
}));

const Navbar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <StyledAppBar position="static">
      <Container maxWidth="lg">
        <Toolbar>
          <Typography variant="h6" component="div" flexGrow={1}>
            FunniT
          </Typography>
          <Box display={isMobile ? 'none' : 'block'}>
            <Button color="inherit" component={NavLink} to="/">Home</Button>
            <Button color="inherit">About</Button>
            <Button color="inherit">Login</Button>
            <Button color="inherit">Register</Button>
            <Button color="inherit" component={NavLink} to="/event-form">Tip Us!</Button>
          </Box>
          <Box display={isMobile ? 'block' : 'none'}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
            >
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