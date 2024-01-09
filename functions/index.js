/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable indent */
/* eslint-disable quotes */
// index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const algoliasearch = require('algoliasearch');
const cors = require('cors')({ origin: true });

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://fed22m-exjobb-funnit.firebaseio.com',
});

const algoliaClient = algoliasearch(
  functions.config().algolia.app_id,
  functions.config().algolia.api_key,
);

const algoliaIndex = algoliaClient.initIndex('events_index');

exports.syncFirestoreToAlgolia = functions.firestore.document("events/{eventId}").onWrite(async (change, context) => {
    const eventData = change.after.exists ? change.after.data() : null;
    const eventId = context.params.eventId;

    // If the document was deleted, remove it from Algolia
    if (!eventData) {
        await algoliaIndex.deleteObject(eventId);
        console.log(`Event ${eventId} deleted from Algolia`);
        return null;
    }

    // If the document is created or updated, add/update it in Algolia
    const algoliaObject = {
        objectID: eventId,
        ...eventData,
    };
    
    await algoliaIndex.saveObject(algoliaObject);
    console.log(`Event ${eventId} indexed in Algolia`, algoliaObject);
    return null;
});

exports.sendCollectionToAlgolia = functions.https.onRequest((req, res) => {
    // Enable CORS using the `cors` express middleware.
    cors(req, res, async () => {
      // Authenticate the request to make sure it's coming from an admin user
      if (req.method !== "POST") {
        res.status(403).send("Forbidden!");
        return;
      }
  
      const authToken = req.get("Authorization");
      if (!authToken) {
        res.status(403).send("No Authorization header provided.");
        return;
      }
  
      const idToken = authToken.split("Bearer ")[1];
      try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        // Check if the token has an 'admin' claim set to true
        console.log("Decoded Token:", decodedToken); // Additional logging
        if (!decodedToken.admin) {
          throw new Error("unauthorized");
        }
        // Token is verified, continue with the function execution
      } catch (error) {
        console.error("Error:", error);
        res.status(403).send("Unauthorized");
        return;
      }
  
      const snapshot = await admin.firestore().collection("events").get();
  
      const algoliaRecords = [];
      snapshot.forEach(doc => {
        const record = doc.data();
        record.objectID = doc.id;
        algoliaRecords.push(record);
      });
  
      try {
        // You may need to batch this if you have a lot of records
        const response = await algoliaIndex.saveObjects(algoliaRecords);
        functions.logger.log(response);
        res.status(200).send("Documents imported to Algolia successfully!");
      } catch (error) {
        functions.logger.error("Error importing to Algolia", error);
        res.status(500).send("Error importing to Algolia");
      }
    });
  });
  


// /* eslint-disable @typescript-eslint/no-var-requires */
// const functions = require("firebase-functions");
// const admin = require("firebase-admin");
// const algoliasearch = require("algoliasearch");

// admin.initializeApp();

// // Initialize Algolia search client
// const algoliaAppId = functions.config().algolia.app_id;
// const algoliaApiKey = functions.config().algolia.api_key;
// const algoliaClient = algoliasearch(algoliaAppId, algoliaApiKey);
// const algoliaIndex = algoliaClient.initIndex("events_index");

// exports.syncFirestoreToAlgolia = functions.firestore.document("events/{eventId}").onWrite(async (change, context) => {
//     const eventData = change.after.exists ? change.after.data() : null;
//     const eventId = context.params.eventId;

//     // If the document was deleted, remove it from Algolia
//     if (!eventData) {
//         await algoliaIndex.deleteObject(eventId);
//         console.log(`Event ${eventId} deleted from Algolia`);
//         return null;
//     }

//     // If the document is created or updated, add/update it in Algolia
//     const algoliaObject = {
//         objectID: eventId,
//         ...eventData,
//     };
    
//     await algoliaIndex.saveObject(algoliaObject);
//     console.log(`Event ${eventId} indexed in Algolia`, algoliaObject);
//     return null;
// });


