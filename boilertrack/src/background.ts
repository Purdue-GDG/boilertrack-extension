//this is to handle the OCR work in the background.

import {createWorker} from '.tesseract-local/tesseract.min.js';

//do the actual OCR
async function OCRfunc(imageURL: string) {
    console.log("Starting OCR process");

    //get the path of the public worker for tesseract
    const workerPath = chrome.runtime.getURL("tesseract-local/worker.min.js");

    //get the path of the public core
    const corePath = chrome.runtime.getURL("tesseract-local/tesseract-core-simd.wasm.js");

    //again for the language module (eng.traineddata.gz) which stores weights for tesseract
    const langPath = chrome.runtime.getURL("tesseract-local/");

    try {
        const worker = await createWorker({
            workerPath,
            corePath,
            langPath,
            logger: m => console.log(m), //log the tesseract progress in console
        });

        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        console.log("Tesseract.js has been initialized");

        const {data: {text}} = await worker.recognize(imageURL);
        console.log('OCR Result:', text);

        await worker.terminate();
        return text;
    } catch (error) {
        console.error("ERROR WITH TESSERACT OCR : \n", error);
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    //if ocr has been initizalized, ocr has been told to run, and an image has been provided:
    if (request.action === 'RUN_OCR' && request.imageURL) {
        OCRfunc(request.imageURL).then(text => {
            sendResponse({success: true, text: text});
        }).catch(error => {
            sendResponse({success: false, error: error.message});
        });

        //reply to the promise to event loop saying a response will be sent async

        return true;
    }
});
