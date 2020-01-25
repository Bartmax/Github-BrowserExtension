var dpiValue = 1;
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    dpiValue = request.dpi;
});
chrome.storage.local.get('dpi', (response) => {
    if (response.dpi) {
        dpiValue = response.dpi;
    }
});

window.addEventListener("paste", function (thePasteEvent) {

    retrieveImageFromClipboardAsBlob(thePasteEvent, function (imageBlob) {

        if (imageBlob && dpiValue != 1) {

            var issueElement = document.getElementById('issue_body');
            var previousState = issueElement.value;

            var img = createImageFromBlob(imageBlob);

            issueElement.addEventListener("change", function (e) {

                var currentState = issueElement.value;

                var newMarkdownData = getNewElementMarkdown(previousState, currentState);
                var newImageMarkdown = newMarkdownData[0];
                var newImageSource = newMarkdownData[1];

                if (!isValidImage(img)) {
                    return
                }

                var newImageTag = getImageTag(newImageSource, parseInt(img.naturalWidth / dpiValue), parseInt(img.naturalHeight / dpiValue));
                var newState = currentState.replace(newImageMarkdown, newImageTag);
                issueElement.value = newState;

            }, { once: true });
        }
    });
}, false);

function isValidImage(img) { return img.naturalWidth > 0 && img.naturalHeight > 0; }

function getNewElementMarkdown(previous, current) {
    var reg = /!\[image\]\((.*)\)/g;
    var currentArray = [...current.matchAll(reg)];
    var currentMarkdownMatch = currentArray.filter(element => element.length > 1 && previous.indexOf(element[1]) === -1);
    if (currentMarkdownMatch.length !== 1) {
        return null;
    }
    return currentMarkdownMatch[0];
}

function getImageTag(src, width, height) {
    // height is not used to keep aspect ration when image gets into github's 100% max-width style
    //return '<img width="' + width + '" height="' + height + '" src="' + src + '" />';
    return '<img width="' + width + '" src="' + src + '" />';
}


function createImageFromBlob(imageBlob, onLoadFunction) {

    var img = new Image();
    var URLObj = window.URL || window.webkitURL;
    img.src = URLObj.createObjectURL(imageBlob);
    return img;
}

function retrieveImageFromClipboardAsBlob(pasteEvent, callback) {
    if (pasteEvent.clipboardData == false) {
        if (typeof (callback) == "function") {
            callback(undefined);
        }
    };

    var items = pasteEvent.clipboardData.items;

    if (items == undefined) {
        if (typeof (callback) == "function") {
            callback(undefined);
        }
    };

    for (var i = 0; i < items.length; i++) {
        // Skip content if not image
        if (items[i].type.indexOf("image") == -1) continue;
        // Retrieve image on clipboard as blob
        var blob = items[i].getAsFile();

        if (typeof (callback) == "function") {
            callback(blob);
        }
    }
}