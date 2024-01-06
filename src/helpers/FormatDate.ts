import { Timestamp } from "firebase/firestore";

export const formatDate = (value: Timestamp | number | string | Date) => {
 
 

  // Check if value is a Firestore Timestamp object
  if (value instanceof Timestamp) {
    value = new Date(value.seconds * 1000); // Convert to JavaScript Date object
  }
  
  // Check if value is a Unix timestamp in milliseconds
  if (typeof value === 'number') {
    value = new Date(value); // Convert to JavaScript Date object
  }

  // Check if value is already a Date object or a valid date string
  if (!(value instanceof Date) && typeof value === 'string') {
    value = new Date(value);
  }

  // Validate the date
  if (!(value instanceof Date) || isNaN(value.getTime())) {
    return ''; // Invalid date
  }

  // Format the date
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(value);
};