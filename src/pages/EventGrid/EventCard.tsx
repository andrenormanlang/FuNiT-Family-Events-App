import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Event } from '../../types/Event.types';
import { Box } from '@mui/system';
import { CardMedia } from '@mui/material';
import defaultImage from '../../assets/images/default-image.webp';
import { useState } from 'react';

interface EventCardProps {
    event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
    
    let date;
    if (event.date) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        date = event.date.toDate();
    }

    const imageUrl = event.imageUrl || defaultImage;

    const [isClicked, setIsClicked] = useState(false);

    const handleCardClick = () => {
        setIsClicked(!isClicked); 
    };

    return (
        <Card 
            sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                minHeight: 300, 
                height: '100%',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out', 
                '&:hover': {
                    transform: 'scale(1.05)', 
                    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)' 
                },
                ...(isClicked && {
                    boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.4)' 
                }) 
            }}
            onClick={handleCardClick}
        >
            <Box position="relative">
                <CardMedia
                    component="img"
                    image={imageUrl}
                    alt={event.name}
                    sx={{
                        height: 'auto',
                        maxHeight: 200, // Limit the image height
                        objectFit: 'cover',
                        width: '100%' // Ensure it takes the full width of the card
                    }}
                />
                <Box position="absolute" bottom={0} left={0} bgcolor="linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5))" color="white">
                    <Box bgcolor="DarkCyan" color="white" p={1}>
                        <Typography variant="body1">{date && date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}</Typography>
                    </Box>
                    <Box bgcolor="SteelBlue" color="white" p={1}>
                        <Typography variant="body1">{date && date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Typography>
                    </Box>
                </Box>
            </Box>
            <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
                    {event.name}
                </Typography>
                {/* <Typography variant="subtitle2" color="textSecondary" paragraph>
                    {event.description}
                </Typography> */}
                <Box marginBottom={1}>
                    <Typography variant="subtitle2" color="primary">
                        Category: {event.category}
                    </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                    {event.address}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Age: {event.ageGroup}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default EventCard;
