import { Timestamp } from "firebase/firestore";

export const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return '';
  
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };