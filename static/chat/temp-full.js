'use strict';

const functions = require('firebase-functions');
const {google} = require('googleapis');
const {WebhookClient} = require('dialogflow-fulfillment');
const vision = require('@google-cloud/vision');
var axios = require("axios");

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
const bucketName = 'cloud-vision-pictures';
const timeZone = 'America/Los_Angeles';
const timeZoneOffset = '-07:00';

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log("Parameters", agent.parameters);

  function applyML(agent){
    const filename = agent.parameters.filename;
    console.log("filename is: ", filename);

    // call vision API to detect text
    return callVisionApi(agent, bucketName, filename).then(result => {
                      console.log(`result is ${result}`);
                      agent.add(`file is being processed, here are the results:  ${result}`);
            //agent.add(`file is being processed ${result}`);
        }).catch((error)=> {
            agent.add(`error occurred at apply ml function`  + error);
        });
  }

  let intentMap = new Map();
  intentMap.set('Explore uploaded image', applyML);
  agent.handleRequest(intentMap);
});


async function callVisionApi(agent, bucketName, fileName){
    // [START vision_text_detection_gcs]
  // Imports the Google Cloud client libraries
  // Creates a client
  
  const client = new vision.ImageAnnotatorClient();
    try {
        // Performs text detection on the gcs file
        const [result] = await client.landmarkDetection(`gs://${bucketName}/${fileName}`);
        const detections = result.landmarkAnnotations;
        var detected = [];
        detections.forEach(text => {
            console.log(text.description);
            detected.push(text.description);
        });
        return detected;
    }
    catch(error) {
        console.log('fetch failed', error);
        return [];
    }
}