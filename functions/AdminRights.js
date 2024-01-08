/* eslint-disable indent */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable quotes */
/* eslint-disable max-len */

const admin = require('firebase-admin');
const serviceAccount = require('./funnit-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://fed22m-exjobb-funnit.firebaseio.com',
});

const uid = ''; // Replace with the UID of the user

admin.auth().getUser(uid)
  .then((userRecord) => {
    console.log(userRecord.customClaims); // This will display the custom claims
    if (userRecord.customClaims && userRecord.customClaims.admin === true) {
      console.log("User is an admin.");
    } else {
      console.log("User is not an admin.");
    }
  })
  .catch((error) => {
    console.log("Error fetching user data:", error);
  });

// const admin = require('firebase-admin');
// const serviceAccount = require('./funnit-adminsdk.json');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: 'https://fed22m-exjobb-funnit.firebaseio.com',
// });

// const uid = ''; // Replace with the UID of the user

// admin.auth().setCustomUserClaims(uid, {admin: true})
//   .then(() => {
//     console.log(`Success! User with UID: ${uid} has been granted admin rights.`);
//     // Now we verify the custom claim has been set as expected
//     return admin.auth().getUser(uid);
//   })
//   .then((userRecord) => {
//     // The custom claims should now be available in the userRecord.customClaims object
//     console.log(userRecord.customClaims);
//   })
//   .catch((error) => {
//     console.error('Error setting admin claim:', error);
//   });
