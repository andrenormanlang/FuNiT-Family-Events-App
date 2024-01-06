/* eslint-disable @typescript-eslint/no-var-requires */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const algoliasearch = require("algoliasearch");

admin.initializeApp();

// Replace the following lines with your Algolia configuration
const algoliaAppId = functions.config().algolia.app_id;
const algoliaApiKey = functions.config().algolia.api_key;

const algoliaClient = algoliasearch(algoliaAppId, algoliaApiKey);
const algoliaIndex = algoliaClient.initIndex("events_index");

exports.syncFirestoreToAlgolia = functions.firestore
    .document("events/{eventId}")
    .onWrite(async (change, context) => {
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
