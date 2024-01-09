/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable indent */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const algoliasearch = require("algoliasearch");
const cors = require("cors")({origin: true});

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://fed22m-exjobb-funnit.firebaseio.com",
});

// Set up Algolia search client with environment variables
const algoliaClient = algoliasearch(functions.config().algolia.app_id, functions.config().algolia.api_key);
const algoliaIndex = algoliaClient.initIndex("events_index");

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
