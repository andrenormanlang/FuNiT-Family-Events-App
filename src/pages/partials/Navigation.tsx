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
    position: 'sticky', // Changed from 'static' to 'sticky'
    top: 0, // Ensures the AppBar sticks to the top
    zIndex: +1, // Ensure AppBar stays on top of other content, like a drawer
    [theme.breakpoints.up('sm')]: {
        marginBottom: theme.spacing(4)
    }
}));

const Navbar: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();
    const { signedInUserInfo, signedInUser, signOutUser, signedInUserName, signedInUserPhotoUrl } = useAuth();
    const { savedEventsCount } = useSavedEvents();

    const navigateHome = () => {
        navigate('/');
    };

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    const handleLogout = async () => {
        try {
            await signOutUser(); // Sign out the user
            navigate('/login'); // Redirect to the home page
            window.location.reload();
            // Optionally, you can trigger a UI state update or display a success message
        } catch (error) {
            console.error('Error during logout:', error);
            // Handle error, e.g., show an error message to the user
        }
    };

    return (
        <StyledAppBar>
            <Container maxWidth="lg">
                <Toolbar>
                    <NavLink
                        to="/"
                        style={{
                            color: 'inherit',
                            textDecoration: 'none',
                            flexGrow: 1
                        }}
                    >
                        <Typography variant="h6" component="div" onClick={navigateHome} style={{ cursor: 'pointer' }}>
                            FunniT
                        </Typography>
                    </NavLink>
                    <Box display={isMobile ? 'none' : 'block'}>
                        <Button color="inherit" onClick={navigateHome} style={{ cursor: 'pointer' }}>
                            Home
                        </Button>
                        <Button color="inherit">About</Button>
                        {signedInUser ? (
                            <>
                                <Button color="inherit" component={NavLink} to="/profile">
                                    Profile
                                </Button>
                                <Button color="inherit" component={NavLink} to="/event-form">
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
                                    }}
                                >
                                    <Button color="inherit" component={NavLink} to="/saved-events">
                                        Saved Events
                                    </Button>
                                </Badge>
                                {/* <Typography
                                                    variant="subtitle1"
                                                    component="span"
                                                    sx={{ marginLeft: 1 }}>
                                                    {signedInUserName}
                                        </Typography> */}
                                {signedInUserInfo && signedInUserInfo.isAdmin && (
                                    <>
                                        <Button color="inherit" component={NavLink} to="/events-list">
                                            Events List
                                        </Button>
                                        <Button color="inherit" component={NavLink} to="/users-list">
                                            Users List
                                        </Button>
                                    </>
                                )}
                                <IconButton color="inherit" component={NavLink} to="/profile" sx={{ p: 0, marginLeft: 2 }}>
                                    <Avatar
                                        src={signedInUserPhotoUrl || undefined}
                                        alt={signedInUserName || 'Profile'}
                                        sx={{ width: 50, height: 50 }}
                                    />
                                </IconButton>
                                <Button color="inherit" onClick={handleLogout}>
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button color="inherit" component={NavLink} to="/register">
                                    Register
                                </Button>
                                <Button color="inherit" component={NavLink} to="/login">
                                    Login
                                </Button>
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
            <StyledDrawer anchor="left" open={drawerOpen} onClose={handleDrawerToggle}>
                <IconButton onClick={handleDrawerToggle} color="inherit" aria-label="close drawer" sx={{ alignSelf: 'flex-end', marginRight: 2 }}>
                    <CloseIcon />
                </IconButton>
                <List sx={{ width: '100%' }}>
                    {signedInUser && (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                marginBottom: 2 // Adds some spacing below the avatar
                            }}
                        >
                            <Avatar
                                src={signedInUserPhotoUrl || undefined}
                                alt={signedInUserName || 'Profile'}
                                sx={{
                                    width: 100,
                                    height: 100,
                                    marginBottom: 1
                                }} // Increase avatar size
                            />
                            <Typography variant="subtitle1" gutterBottom sx={{ textTransform: 'uppercase' }}>
                                {signedInUserName}
                            </Typography>
                        </Box>
                    )}
                    <ListItem>
                        <ListItemButton onClick={handleDrawerToggle} sx={{ justifyContent: 'center' }}>
                            <Button color="inherit" component={NavLink} to="/">
                                Home
                            </Button>
                        </ListItemButton>
                    </ListItem>
                    <ListItem>
                        <ListItemButton onClick={handleDrawerToggle} sx={{ justifyContent: 'center' }}>
                            <Button color="inherit">About</Button>
                        </ListItemButton>
                    </ListItem>

                    {signedInUser ? (
                        // Logged-in user menu items
                        <>
                            <ListItem>
                                <ListItemButton component={NavLink} to="/profile" onClick={handleDrawerToggle} sx={{ justifyContent: 'center' }}>
                                    <Button color="inherit">Profile</Button>
                                </ListItemButton>
                            </ListItem>
                            <ListItem>
                                <ListItemButton component={NavLink} to="/event-form" onClick={handleDrawerToggle} sx={{ justifyContent: 'center' }}>
                                    <Button color="inherit">Tip Us!</Button>
                                </ListItemButton>
                            </ListItem>
                            <ListItem>
                                <ListItemButton component={NavLink} to="/saved-events" onClick={handleDrawerToggle} sx={{ justifyContent: 'center' }}>
                                    <Button color="inherit">Saved Events ({savedEventsCount})</Button>
                                </ListItemButton>
                            </ListItem>
                            {signedInUserInfo && signedInUserInfo.isAdmin && (
                                <>
                                    <ListItem>
                                        <ListItemButton
                                            component={NavLink}
                                            to="/events-list"
                                            onClick={handleDrawerToggle}
                                            sx={{ justifyContent: 'center' }}
                                        >
                                            <Button color="inherit">Events List</Button>
                                        </ListItemButton>
                                    </ListItem>
                                    <ListItem>
                                        <ListItemButton
                                            component={NavLink}
                                            to="/users-list"
                                            onClick={handleDrawerToggle}
                                            sx={{ justifyContent: 'center' }}
                                        >
                                            <Button color="inherit">Users List</Button>
                                        </ListItemButton>
                                    </ListItem>
                                </>
                            )}
                            <ListItem>
                                <ListItemButton onClick={handleLogout} sx={{ justifyContent: 'center' }}>
                                    <Button color="inherit">Logout</Button>
                                </ListItemButton>
                            </ListItem>
                        </>
                    ) : (
                        // Non-logged-in user menu items
                        <>
                            <ListItem>
                                <ListItemButton component={NavLink} to="/login" onClick={handleDrawerToggle} sx={{ justifyContent: 'center' }}>
                                    <Button color="inherit">Login</Button>
                                </ListItemButton>
                            </ListItem>
                            <ListItem>
                                <ListItemButton component={NavLink} to="/register" onClick={handleDrawerToggle} sx={{ justifyContent: 'center' }}>
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
