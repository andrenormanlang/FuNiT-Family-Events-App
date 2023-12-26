import React, { useState } from 'react';
import {
    AppBar,
    Avatar,
    Toolbar,
    Typography,
    Button,
    Container,
    useMediaQuery,
    Box,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    Badge
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled, useTheme } from '@mui/system';
import MenuIcon from '@mui/icons-material/Menu';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useSavedEvents } from '../../contexts/SavedEventsProvider';

const StyledDrawer = styled(Drawer)(({ theme }) => ({
    '& .MuiDrawer-paper': {
        boxSizing: 'border-box',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // Center the content
        paddingTop: theme.spacing(2),
        backgroundColor: theme.palette.warning.main // Use the default background color from theme
    }
}));
const StyledAppBar = styled(AppBar)(({ theme }) => ({
    [theme.breakpoints.up('sm')]: {
        marginBottom: theme.spacing(4)
    }
}));

const Navbar: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();
    const {
        signedInUser,
        signOutUser,
        signedInUserEmail,
        signedInUserName,
        signedInUserPhotoUrl
    } = useAuth();
    const { savedEventsCount } = useSavedEvents();

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    const handleLogout = async () => {
        await signOutUser();
        navigate('/');
    };

    return (
        <StyledAppBar position="static">
            <Container maxWidth="lg">
                <Toolbar>
                    <NavLink
                        to="/"
                        style={{
                            color: 'inherit',
                            textDecoration: 'none',
                            flexGrow: 1
                        }}>
                        <Typography variant="h6" component="div">
                            FunniT
                        </Typography>
                    </NavLink>
                    <Box display={isMobile ? 'none' : 'block'}>
                        <Button color="inherit" component={NavLink} to="/">
                            Home
                        </Button>
                        <Button color="inherit">About</Button>
                        {signedInUser ? (
                            <>
                                <Button
                                    color="inherit"
                                    component={NavLink}
                                    to="/profile">
                                    Profile
                                </Button>
                                <IconButton
                                    color="inherit"
                                    component={NavLink}
                                    to="/profile"
                                    sx={{ p: 0, marginLeft: 2 }}>
                                    <Avatar
                                        src={signedInUserPhotoUrl || undefined}
                                        alt={signedInUserName || 'Profile'}
                                        sx={{ width: 30, height: 30 }}
                                    />
                                </IconButton>
                                <Typography
                                    variant="subtitle1"
                                    component="span"
                                    sx={{ marginLeft: 1 }}>
                                    {signedInUserName}
                                </Typography>
                                <Button color="inherit" onClick={handleLogout}>
                                    Logout
                                </Button>
                                <Button
                                    color="inherit"
                                    component={NavLink}
                                    to="/event-form">
                                    Tip Us!
                                </Button>
                                <Badge
                                    badgeContent={savedEventsCount}
                                    color="secondary"
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right'
                                    }}
                                    sx={{
                                        '.MuiBadge-badge': {
                                            right: -7, // Adjust horizontal position
                                            top: -1, // Adjust vertical position
                                            transform: 'scale(1)'
                                        }
                                    }}>
                                    <Button
                                        color="inherit"
                                        component={NavLink}
                                        to="/saved-events">
                                        Saved Events
                                    </Button>
                                </Badge>
                            </>
                        ) : (
                            <>
                                <Button
                                    color="inherit"
                                    component={NavLink}
                                    to="/login">
                                    Login
                                </Button>
                                <Button
                                    color="inherit"
                                    component={NavLink}
                                    to="/register">
                                    Register
                                </Button>
                            </>
                        )}
                    </Box>
                    <Box display={isMobile ? 'block' : 'none'}>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}>
                            <MenuIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </Container>
            <StyledDrawer
                anchor="left"
                open={drawerOpen}
                onClose={handleDrawerToggle}>
                <IconButton
                    onClick={handleDrawerToggle}
                    color="inherit"
                    aria-label="close drawer"
                    sx={{ alignSelf: 'flex-end', marginRight: 2 }}>
                    <CloseIcon />
                </IconButton>
                <List sx={{ width: '100%' }}>
                    <ListItem>
                        <ListItemButton
                            onClick={handleDrawerToggle}
                            sx={{ justifyContent: 'center' }}>
                            <Button color="inherit" component={NavLink} to="/">
                                Home
                            </Button>
                        </ListItemButton>
                    </ListItem>
                    <ListItem>
                        <ListItemButton
                            onClick={handleDrawerToggle}
                            sx={{ justifyContent: 'center' }}>
                            <Button color="inherit">About</Button>
                        </ListItemButton>
                    </ListItem>

                    {signedInUser ? (
                        // Logged-in user menu items
                        <>
                            <Avatar
                                src={signedInUserPhotoUrl || undefined}
                                alt={signedInUserName || 'Profile'}
                                sx={{ width: 60, height: 60, marginBottom: 1 }}
                            />
                            <Typography variant="subtitle1" gutterBottom>
                                {signedInUserName}
                            </Typography>
                            <ListItem>
                                <ListItemButton
                                    component={NavLink}
                                    to="/profile"
                                    onClick={handleDrawerToggle}
                                    sx={{ justifyContent: 'center' }}>
                                    <Button color="inherit">Profile</Button>
                                </ListItemButton>
                            </ListItem>
                            <ListItem>
                                <ListItemButton
                                    component={NavLink}
                                    to="/event-form"
                                    onClick={handleDrawerToggle}
                                    sx={{ justifyContent: 'center' }}>
                                    <Button color="inherit">Tip Us!</Button>
                                </ListItemButton>
                            </ListItem>
                            <ListItem>
                                <ListItemButton
                                    component={NavLink}
                                    to="/saved-events"
                                    onClick={handleDrawerToggle}
                                    sx={{ justifyContent: 'center' }}>
                                    <Button color="inherit">
                                        Saved Events ({savedEventsCount})
                                    </Button>
                                </ListItemButton>
                            </ListItem>
                            <ListItem>
                                <ListItemButton
                                    onClick={handleLogout}
                                    sx={{ justifyContent: 'center' }}>
                                    <Button color="inherit">Logout</Button>
                                </ListItemButton>
                            </ListItem>
                        </>
                    ) : (
                        // Non-logged-in user menu items
                        <>
                            <ListItem>
                                <ListItemButton
                                    component={NavLink}
                                    to="/login"
                                    onClick={handleDrawerToggle}
                                    sx={{ justifyContent: 'center' }}>
                                    <Button color="inherit">Login</Button>
                                </ListItemButton>
                            </ListItem>
                            <ListItem>
                                <ListItemButton
                                    component={NavLink}
                                    to="/register"
                                    onClick={handleDrawerToggle}
                                    sx={{ justifyContent: 'center' }}>
                                    <Button color="inherit">Register</Button>
                                </ListItemButton>
                            </ListItem>
                        </>
                    )}
                </List>
            </StyledDrawer>
        </StyledAppBar>
    );
};

export default Navbar;
