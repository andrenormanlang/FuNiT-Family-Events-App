import { Timestamp } from "firebase/firestore";

export const formatDate = (value: number | string | Date | Timestamp | undefined) => {
  // Handle undefined values
  if (value === undefined) {
    return ''; // or return a default message
  }

  let date: Date;

  // Check if value is a Firestore Timestamp object
  if (value instanceof Timestamp) {
    date = new Date(value.seconds * 1000); // Convert to JavaScript Date object
  }
  // Check if value is a Unix timestamp in milliseconds
  else if (typeof value === 'number') {
    date = new Date(value); // Convert to JavaScript Date object
  }
  // Check if value is already a Date object or a valid date string
  else if (typeof value === 'string' || value instanceof Date) {
    date = new Date(value);
  }
  // Handle other unexpected types
  else {
    return 'Invalid date';
  }

  // Validate the date
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  // Format the date
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric', // Added year for more clarity
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
};