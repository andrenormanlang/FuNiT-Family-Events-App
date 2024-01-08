
import { config, firestore } from "firebase-functions";
import { initializeApp } from "firebase-admin";
import algoliasearch from "algoliasearch";

initializeApp();

// Replace the following lines with your Algolia configuration
const algoliaAppId = config().algolia.app_id;
const algoliaApiKey = config().algolia.api_key;

const algoliaClient = algoliasearch(algoliaAppId, algoliaApiKey);
const algoliaIndex = algoliaClient.initIndex("events_index");

export const syncFirestoreToAlgolia = firestore.document("events/{eventId}").onWrite(async (change, context) => {
    const eventData = change.after.exists ? change.after.data() : null;
    const eventId = context.params.eventId;

    // If the document was deleted, remove it from Algolia
    if (!eventData) {
        await algoliaIndex.deleteObject(eventId);
        return null;
    }

    // If the document is created or updated, add/update it in Algolia
    await algoliaIndex.saveObject({
        objectID: eventId,
        ...eventData,
    });
    return null;
});

// Rebuild the Algolia
// const algoliasearch = require("algoliasearch");
// const admin = require("firebase-admin");

// // Initialize Firebase Admin SDK
// admin.initializeApp({
//   // Your Firebase config
// });

// // Initialize Firestore
// const db = admin.firestore();

// // Initialize Algolia
// const algoliaClient =
// algoliasearch(
//  functions.config().algolia.app_id, functions.config().algolia.api_key);
// const algoliaIndex = algoliaClient.initIndex("events_index");

// // eslint-disable-next-line require-jsdoc
// async function rebuildIndex() {
//   // Fetch data from Firestore
//   const querySnapshot = await db.collection("events").get();

//   // Format data for Algolia
//   const records = querySnapshot.docs.map((doc) => {
//     const record = doc.data();
//     record.objectID = doc.id; // Algolia requires an objectID
//     return record;
//   });

//   // Optionally clear the index
//   // await algoliaIndex.clearObjects();

//   // Push data to Algolia
//   await algoliaIndex.saveObjects(records);

//   console.log("Index has been rebuilt with Firestore data.");
// }

// rebuildIndex().catch(console.error);
