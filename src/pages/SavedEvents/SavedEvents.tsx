import { useState, useEffect } from 'react';
import { collection, query, where, deleteDoc, doc, onSnapshot, orderBy, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../../services/firebase';
import {
    Grid,
    Box,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Typography,
    CircularProgress
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EventCard from '../EventGrid/EventCard';
import { SavedEvent } from '../../types/SavedEvent.types';
import { useSavedEvents } from '../../contexts/SavedEventsProvider';
import Pagination from '../../components/MUI/Pagination';
import { useSearchParams } from 'react-router-dom';
import { useSnackbar } from '../../contexts/SnackBarProvider';

const SavedEvents = () => {
    const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const auth = getAuth();
    const user = auth.currentUser;
    const { updateSavedEventsCount } = useSavedEvents();
    const [searchParams] = useSearchParams();
    const itemsPerPage = 6; // Number of items per page
    const { showMessage } = useSnackbar();

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
          const q = query(
            collection(db, 'savedEvents'), 
            where('userId', '==', user.uid),
            orderBy('eventData.eventDateTime', 'asc')
          );
      
          const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            setIsLoading(true);
            try {
              const updates = querySnapshot.docs.map((docSnapshot) => {
                const savedEventData = docSnapshot.data();
                const eventRef = doc(db, 'events', savedEventData.eventId);
      
                return getDoc(eventRef).then((eventSnap) => {
                  if (eventSnap.exists()) {
                    return {
                      id: docSnapshot.id,
                      userId: savedEventData.userId,
                      eventId: savedEventData.eventId,
                      eventData: {
                        ...eventSnap.data(), // Ensure all properties of Event are included
                        id: eventSnap.id // Include the event's ID if needed
                      }
                    } as SavedEvent;
                  } else {
                    return null;
                  }
                });
              });
      
              const resolvedUpdates = (await Promise.all(updates)).filter(Boolean) as SavedEvent[];
              setSavedEvents(resolvedUpdates);
            } catch (error) {
              console.error('Error getting saved events: ', error);
              showMessage(typeof error === "string" ? error : (error as Error).message || "An error occurred");
            }
            setIsLoading(false);
          }, (error) => {
            console.error('Error with real-time updates: ', error);
            showMessage(typeof error === "string" ? error : (error as Error).message || "An error occurred");
            setIsLoading(false);
          });
      
          return () => unsubscribe();
        }
      }, [user, showMessage]);

    const handleDialogOpen = (eventId: string) => {
        setOpenDialog(true);
        setSelectedEventId(eventId);
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
    };

    const handleUnsaveEvent = async () => {
        if (selectedEventId) {
            try {
                await deleteDoc(doc(db, 'savedEvents', selectedEventId));
                setSavedEvents(savedEvents.filter((event) => event.id !== selectedEventId));
                handleDialogClose();
                updateSavedEventsCount();
            } catch (error) {
                console.error('Error unsaving event: ', error);
            }
        }
    };

    const page = Number(searchParams.get('page')) || 1;
    const savedEventsForPage = savedEvents.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <Box display="flex" flexDirection="column" alignItems="center" marginTop={2}>
            {isLoading ? (
                <CircularProgress />
            ) : savedEvents.length === 0 ? (
                <Typography variant="h6" sx={{ mt: 2 }}>
                    You have no saved events at the moment.
                </Typography>
            ) : (
                <>
                    <Grid container spacing={2} justifyContent="center" style={{ maxWidth: '1200px' }}>
                        {savedEventsForPage.map((savedEvent) => (
                            <Grid item key={savedEvent.id} xs={11} sm={5.5} md={5.5} lg={4} xl={4}>
                                <Box position="relative">
                                    <EventCard event={savedEvent.eventData} isSaved={true} isAdmin={false} />
                                    <Tooltip title="Unsave Event" placement="top">
                                        <IconButton
                                            onClick={() => handleDialogOpen(savedEvent.id)}
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                right: 0,
                                                m: 1,
                                                bgcolor: 'background.paper',
                                                '&:hover': { bgcolor: 'grey.300' }
                                            }}>
                                            <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                    {savedEvents.length > 0 && (
                        <Box display="flex" justifyContent="center" width="100%" marginTop={2} marginBottom={2}>
                            <Pagination count={Math.ceil(savedEvents.length / itemsPerPage)}  />
                        </Box>
                    )}
                </>
            )}
            <Dialog open={openDialog} onClose={handleDialogClose}>
                <DialogTitle>{'Unsave this Event?'}</DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure you want to unsave this event? This action cannot be undone.</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleUnsaveEvent} color="primary" autoFocus>
                        Unsave
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SavedEvents;