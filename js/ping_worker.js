function pingHost(host) {
    console.log("pingHost");
    var xhr = new XMLHttpRequest();
    xhr.open('GET', host, true);
    xhr.onreadystatechange = function (oEvent) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                self.postMessage(true);
            } else {
                self.postMessage(false);
            }
        }
    };
    xhr.send(null);
}

self.addEventListener('message', function (msg) {
    pingHost(msg.data);
    setInterval(function () {
        pingHost(msg.data)
    }, 10000);
}, false);