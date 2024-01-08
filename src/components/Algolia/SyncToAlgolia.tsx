import  { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import { callSendCollectionToAlgolia } from '../../services/algolia';
import useAuth from '../../hooks/useAuth';
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import { useSnackbar } from '../../contexts/SnackBarProvider'; // adjust path as needed
import { Box, Typography } from '@mui/material';

  function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress variant="determinate" {...props} />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography variant="body2" color="text.secondary">{`${Math.round(
            props.value,
          )}%`}</Typography>
        </Box>
      </Box>
    );
  }

function Algolia() {
    const [progress, setProgress] = useState(10);
    const { signedInUser } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const { showMessage } = useSnackbar(); // Use your custom snackbar hook

  const handleSyncToAlgolia = async () => {
    if (signedInUser) {
      setIsSyncing(true);
      try {
        await callSendCollectionToAlgolia(signedInUser);
        showMessage('Data successfully synced to Algolia!');
      } catch (error) {
        console.error('Error syncing to Algolia:', error);
        showMessage('Failed to sync data to Algolia.');
      } finally {
        setIsSyncing(false);
      }
    } else {
      console.error('User is not signed in');
      showMessage('You must be signed in to sync data.');
    }
  };
  
    useEffect(() => {
      const timer = setInterval(() => {
        setProgress((prevProgress) => (prevProgress >= 100 ? 10 : prevProgress + 10));
      }, 800);
      return () => {
        clearInterval(timer);
      };
    }, []);
  
  

  return (
    <Button 
      variant="contained" 
      color="primary" 
      onClick={handleSyncToAlgolia}
      disabled={isSyncing}
      sx={{
       
        marginTop: '20px',
        // marginRight: '10px',
        // marginBottom: '20px',
        marginLeft: '30px',
      }}
      
    >
      {isSyncing ? <LinearProgressWithLabel value={progress} /> : 'Sync to Algolia'}
    </Button>
  );
}

export default Algolia;