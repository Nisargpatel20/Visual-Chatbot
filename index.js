'use strict';

const functions = require('firebase-functions');
const {google} = require('googleapis');
const {WebhookClient} = require('dialogflow-fulfillment');
const vision = require('@google-cloud/vision');
  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
const bucketName = '<your GCS media bucket name>';
const timeZone = 'America/Los_Angeles';
const timeZoneOffset = '-07:00';

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log("Parameters", agent.parameters);
  
  
  var Flag = false;

  function applyML(agent){
	const filename = agent.parameters.filename;
    console.log("filename is: ", filename);

    agent.context.set('filename', 99, {
  		Filename: filename
  	});
	Flag = false;
    // call vision API to detect text
    return callVisionApi(agent, bucketName, filename, Flag).then(result => {
                      console.log(`result is ${result}`);
                      agent.add(`Landmarks :  ${result}`);
            //agent.add(`file is being processed ${result}`);
        }).catch((error)=> {
            agent.add(`error occurred at apply ml function`  + error);
        });
  }

  function applyML2(agent){
    //const filename = agent.parameters.filename;
   	const infoContext = agent.context.get('filename');
	const filename2 = infoContext.parameters.Filename;
    Flag = true;
    console.log("filename is: 222 ", filename2);
    //const infoContext = agent.context.get('info');
	//const token = infoContext.parameters.token;

    // call vision API to detect text
    return callVisionApi(agent, bucketName, filename2, Flag).then(result => {
                      console.log(`result is ${result}`);
                      agent.add(`Hashtags :  ${result}`);
            //agent.add(`file is being processed ${result}`);
        }).catch((error)=> {
            agent.add(`error occurred at apply ml function`  + error);
        });
  }
  
  let intentMap = new Map();
  intentMap.set('Explore uploaded image', applyML);
  intentMap.set('Explore uploaded image - custom', applyML2);
  agent.handleRequest(intentMap);
});

async function callVisionApi(agent, bucketName, fileName, Flag){
    // [START vision_text_detection_gcs]
  // Imports the Google Cloud client libraries
  // Creates a client
  
  const client = new vision.ImageAnnotatorClient();
    try {
      	var detected = [];
        // perform Label detection
      	if(Flag){
          const [result] = await client.labelDetection(`gs://${bucketName}/${fileName}`);
          const labels = result.labelAnnotations;
          console.log('Labels: in If---',labels);
          //labels.forEach(label => console.log(label.description));
            labels.forEach(text => {
              console.log(text.description);
              detected.push(text.description);
            });
        }
      	else{
        // Performs Landmark detection on the gcs file
          const [result] = await client.landmarkDetection(`gs://${bucketName}/${fileName}`);
          console.log("---result in detection--",result);
          const detections = result.landmarkAnnotations;
          detections.forEach(text => {
              console.log(text.description);
              detected.push(text.description);
          });
        }
        return detected;
    }
    catch(error) {
        console.log('fetch failed', error);
        return [];
    }
}