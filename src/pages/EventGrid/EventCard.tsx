import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Event } from '../../types/Event.types';
import { Box, Button, Tooltip } from '@mui/material';
import { CardMedia } from '@mui/material';
import defaultImage from '../../assets/images/default-image.webp';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Delete, Edit } from '@mui/icons-material';

interface EventCardProps {
    event: Event;
    isSaved: boolean;
    isAdmin: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, isSaved, isAdmin }) => {
    const navigate = useNavigate(); // or const history = useHistory(); in v5

    const theme = useTheme();

    let date: Date | undefined;
    if (event && event.eventDateTime) {
        date = event.eventDateTime.toDate();
    }

    const imageUrl = event.imageUrl || defaultImage;

    const [isClicked, setIsClicked] = useState(false);

    const handleCardClick = () => {
        setIsClicked(!isClicked);
        navigate(`/${event.id}`); // Use event.id or the appropriate identifier
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevents the card click event
        navigate(`/edit-event/${event.id}`);
    };

    const handleDeleteClick = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevents the card click event
        if (window.confirm('Are you sure you want to delete this event?')) {
            await deleteDoc(doc(db, 'events', event.id));
            // Add additional logic if needed to update the UI or state
        }
    };

    return (
        <Card
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: 380,               
                backgroundColor: theme.palette.background.default,
                border: isSaved ? '5px solid green' : 'none', //
                typography: theme.typography,
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)'
                },
                ...(isClicked && {
                    boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.4)'
                })
            }}
            onClick={handleCardClick}>
            {/* Edit Button */}

            {/* Rest of the card content */}
            <Box position="relative">
                <CardMedia
                    component="img"
                    image={imageUrl}
                    alt={event.name}
                    sx={{
                        height: 220, // Set a fixed height for the image
                        objectFit: 'cover' // Ensure it takes the full width of the card
                    }}
                />
                {isAdmin && (
                    <>
                        {/* Edit Button */}
                        <Tooltip title="Edit">
            <Button 
                onClick={handleEditClick} 
                sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    left: 8, 
                    color: 'yellow'
                }}
            >
                <Edit />
            </Button>
        </Tooltip>
        <Tooltip title="Delete">
            <Button 
                onClick={handleDeleteClick} 
                sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8, 
                    color: 'red'
                }}
            >
                <Delete />
            </Button>
        </Tooltip>
                    </>
                )}
                <Box position="absolute" bottom={0} left={0} bgcolor="linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5))" color="white">
                    <Box bgcolor="DarkCyan" color="white" p={1}>
                        <Typography variant="body1"> {date && date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}</Typography>
                    </Box>
                    <Box bgcolor="SteelBlue" color="white" p={1}>
                        <Typography variant="body1">{date && date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Typography>
                    </Box>
                </Box>
            </Box>
            <CardContent>
                <Typography variant='h1' fontSize={25} component="div" gutterBottom>
                    {event.name}
                </Typography>
                {/* <Typography variant="subtitle2" color="textSecondary" paragraph>
                    {event.description}
                </Typography> */}
                <Box marginBottom={1}>
                    <Typography variant='h6' fontSize={15} color="primary">
                        {event.category}
                    </Typography>
                </Box>
                <Typography fontSize={13} fontWeight={600} color="textSecondary">
                    {event.address}
                </Typography>
                <Typography fontSize={13} fontWeight={600} color="textSecondary">
                    {event.ageGroup}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default EventCard;
