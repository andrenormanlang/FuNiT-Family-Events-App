import { Timestamp } from "firebase/firestore";

export const formatDate = (timestamp: Timestamp) => {
  if (!timestamp) return '';

  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false // use false for 24-hour format
  });
};