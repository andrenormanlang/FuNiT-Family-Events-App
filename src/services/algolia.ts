import { User } from "firebase/auth";

export const callSendCollectionToAlgolia = async (user: User) => {
    if (!user) {
      console.error('No authenticated user found!');
      return;
    }
  
    try {
      const idToken = await user.getIdToken();
  
      // Replace with your actual Cloud Function endpoint
      const cloudFunctionUrl = 'https://us-central1-fed22m-exjobb-funnit.cloudfunctions.net/sendCollectionToAlgolia';
  
      const response = await fetch(cloudFunctionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      console.log('Collection successfully sent to Algolia');
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error('Error calling sendCollectionToAlgolia:', error);
    }
  };