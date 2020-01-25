var dpiValue = 1;
const dpiElement = document.getElementById("dpi");

if (dpiElement) {
    chrome.storage.local.get('dpi', (response) => {
        if (response.dpi) {
            dpiValue = response.dpi;
            dpiElement.value = dpiValue;
        }
    });
    dpiElement.oninput = function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                { dpi: dpiElement.value }
            );
        });
        chrome.storage.local.set({ "dpi": dpiElement.value });
    }
}