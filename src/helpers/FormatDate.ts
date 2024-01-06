import { Timestamp } from "firebase/firestore";

export const formatDate = (value: Timestamp | number) => {
    if (!value) return '';
  
    let date;
    if (value instanceof Timestamp) {
      date = value.toDate();
    } else {
      date = new Date(value);
    }
  
    // If the hour is 24, reset to 0 (12 AM)
    const hours = date.getHours() === 24 ? 0 : date.getHours();
  
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', // "Jan"
      day: '2-digit', // "01"
      hour: 'numeric', // "12"
      minute: '2-digit', // "00"
      hour12: true // "AM" or "PM"
    }).format(new Date(date.setHours(hours)));
  };