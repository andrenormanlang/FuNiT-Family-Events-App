import { CircularProgress } from '@mui/material';
import { withStyles } from 'm'
const ColorCircularProgress = withStyles({
  root: {
    // Use backgroundImage instead of color for gradients
    backgroundImage: 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)',
    // Additional styles can be added here
  },
})(CircularProgress);

export default ColorCircularProgress;