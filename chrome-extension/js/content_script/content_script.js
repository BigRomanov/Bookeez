console.log("Running content script");

// Get the head of the document
console.log($('head').html());
console.log($('meta').html());



chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        if(request.method == "getText"){
            console.log("Received getText");
            sendResponse({data: document.all[0].innerText, method: "getText"}); //same as innerText
        }
    }
);