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
import CustomListItemButton from '../../helpers/ListItemButton';

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

    // const navigateHome = () => {
    //     navigate('/?page=1');
    // };

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
                    <Typography variant="h6" component="div" style={{ flexGrow: 1, cursor: 'pointer' }}>
                        <a href="/" style={{ color: 'inherit', textDecoration: 'inherit' }}>
                            FunniT
                        </a>
                    </Typography>
                    <Box display={isMobile ? 'none' : 'block'}>
                        {/* <Button color="inherit" onClick={navigateHome} style={{ cursor: 'pointer' }}> */}
                        <Button color="inherit" style={{ cursor: 'pointer' }}>
                            <a href="/" style={{ color: 'inherit', textDecoration: 'inherit' }}>
                                Home
                            </a>
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
                            <Typography
                                variant="body1"
                                gutterBottom
                                sx={{ textTransform: 'uppercase', fontFamily: '"Sansita", sans-serif', fontSize: '2rem' }}
                            >
                                {signedInUserName}
                            </Typography>
                        </Box>
                    )}
                    <ListItem>
                        <ListItemButton onClick={handleDrawerToggle} sx={{ justifyContent: 'center' }}>
                            <Button color="inherit" style={{ padding: 0 }}>
                                <a href="/" style={{ color: 'inherit', textDecoration: 'inherit' }}>
                                    <Typography
                                        variant="body1"
                                        gutterBottom
                                        sx={{ textTransform: 'uppercase', fontFamily: '"Sansita", sans-serif', fontSize: '1.5rem' }}
                                    >
                                        Home
                                    </Typography>
                                </a>
                            </Button>
                        </ListItemButton>
                    </ListItem>
                    <CustomListItemButton onClick={handleDrawerToggle} to="/about" text="About" />

                    {signedInUser ? (
                        // Logged-in user menu items
                        <>
                            <CustomListItemButton onClick={handleDrawerToggle} to="/profile" text="Profile" />
                            <CustomListItemButton onClick={handleDrawerToggle} to="/event-form" text="Tip Us!" />
                            <CustomListItemButton onClick={handleDrawerToggle} to="/saved-events" text="Saved Events" />
                            {signedInUserInfo && signedInUserInfo.isAdmin && (
                                <>
                                    <CustomListItemButton onClick={handleDrawerToggle} to="/events-list" text="Events List" />
                                    <CustomListItemButton onClick={handleDrawerToggle} to="/users-list" text="Users List" />
                                </>
                            )}
                            <CustomListItemButton onClick={handleDrawerToggle} to="/logout" text="Logout" />
                        </>
                    ) : (
                        // Non-logged-in user menu items
                        <>
                            <CustomListItemButton onClick={handleDrawerToggle} to="/login" text="Login" />
                            <CustomListItemButton onClick={handleDrawerToggle} to="/register" text="Register" />
                        </>
                    )}
                </List>
            </StyledDrawer>
        </StyledAppBar>
    );
};

export default Navbar;
