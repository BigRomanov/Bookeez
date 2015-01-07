console.log("Running content script");
chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        if(request.method == "getText"){
            console.log("Received getText");
            sendResponse({data: document.all[0].innerText, method: "getText"}); //same as innerText
        }
    }
);