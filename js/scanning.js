var scans = [];

function loadScans() {
    localforage.getItem("scans").then(loadScansDone);
}
function loadScansDone(value) {
    console.log("loadScansDone");
    //console.log(value);

    if (!value) {
        scans = [];
    } else {
        scans = value;
    }

    console.log(scans);
}

function setScans() {
    localforage.setItem("scans", scans).then(setScansDone);
}
function setScansDone(value) {
    console.log("setScansDone");
    console.log(scans);
}

function clearScans() {
    console.log(clearScans);
    localforage.clear(function (err) {
        console.log("scans were cleared!");
        console.log(scans);
    });
}

function addScan(s) {
    console.log("addScan");
    scans.push(s);
    setScans();
    console.log(scans);
}