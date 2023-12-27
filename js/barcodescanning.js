function BarcodeScanning(options) {
    var me = this;
    me.data = {};
    me.elements = {
        standardRadioButton: document.querySelector('input[type=radio][name=scan-type][value=standard]'),
        cameraRadioButton: document.querySelector('input[type=radio][name=scan-type][value=camera]'),
        scanInput: document.querySelector('input[name=scan-input]'),
        maintainScanFocusInput: document.querySelector('input[type=checkbox][name=maintainscanfocus]'),
        standardScanArea: document.querySelector('div.standard-scan-type'),
        cameraScanArea: document.querySelector('div.camera-scan-type')
    };

    me.init = function() {
        try {
            me.loadScans();
            me.scanDetector = new ScanDetector({
                target: document.querySelector('input[name="scan-input"]')
            });
            me.startEventListeners();
        } catch (error) {
            console.log(error);
            alert(error);
        }
    };

    me.startBarcodeScanner = function() {
        me.stopBarcodeScanner();
        me.html5QrcodeScanner = new Html5QrcodeScanner(
            "reader", { fps: 1, qrbox: 250 });
        me.html5QrcodeScanner.render(function(decodedText, decodedResult) {
            console.log(decodedText, decodedResult);
            me.addScan({
                text: decodedText,
                timestamp: new Date().getTime()
            });
        });
    };

    me.stopBarcodeScanner = function() {
        if (me.html5QrcodeScanner) me.html5QrcodeScanner.clear();
    };

    me.addScan = function(scan) {
        me.playAudio();
        me.data.scans.push(scan)
        me.saveScans();
    };

    me.clearScans = function() {
        me.data.scans = [];
        me.saveScans();
    };

    me.loadScans = function() {
        me.data.scans = JSON.parse(localStorage.getItem('scans') || '[]');
        me.populateHistory();
    };

    me.removeScan = function(index) {
        me.data.scans.splice(index, 1);
        me.saveScans();
    };

    me.saveScans = function() {
        localStorage.setItem('scans', JSON.stringify(me.data.scans));
        me.populateHistory();
    };

    me.onChangeHandler = function(e) {
        let target = e.target;
        if (target === me.elements.standardRadioButton || target === me.elements.cameraRadioButton) {
            if (me.elements.standardRadioButton.checked) {
                me.stopBarcodeScanner();
                me.elements.cameraScanArea.classList.add('w3-hide');
                me.elements.standardScanArea.classList.remove('w3-hide');
                me.elements.scanInput.focus();
                return;
            }
            if (me.elements.cameraRadioButton.checked) {
                me.elements.standardScanArea.classList.add('w3-hide');
                me.elements.cameraScanArea.classList.remove('w3-hide');
                me.startBarcodeScanner();
                return;
            }
        }
    };

    me.onClickHandler = function(e) {
        let target = e.target;
        if (target.classList.contains('clear-scans')) {
            if (!confirm("are you sure?")) return;
            me.clearScans();
            return;
        }
        if (target.classList.contains('clear-scan')) {
            let row = target.closest('tr');
            let index = parseInt(row.getAttribute('index'));
            if (!confirm("are you sure?")) return;
            me.removeScan(index);
            return;
        }
        if (target.classList.contains('export-scans')) {
            me.exportScans();
            return;
        }
        if (target === document.querySelector('input[name=maintainscanfocus]')) {
            if (target.checked) document.querySelector('input[name="scan-input"]').focus();
            return;
        }
        if (target.classList.contains('toggle-sound')) {
            if (target.innerHTML.trim() === '🔇') target.innerHTML = '🔊'
            else target.innerHTML = '🔇';
        }
    };

    me.exportScans = function () {
        var csv = '';
        var table = document.querySelector('table');
        var rows = table.querySelectorAll('tr');
        rows.forEach(function (item, index) {
            var cells = item.querySelectorAll('td, th');
            cells.forEach(function (item, index) {
                var csvValue = "";
                var anchorChildren = item.getElementsByTagName('a');
                var buttonChildren = item.getElementsByTagName('button');
                if (anchorChildren.length > 0) {
                    csvValue = '"' + anchorChildren[0].innerText + '"';
                } else if (buttonChildren.length > 0) {
                    return;
                } else {
                    csvValue = '"' + item.innerText + '"';
                }
                csvValue += ',';
                csv += csvValue;
            });
            csv += '\n';
        });

        var blob = new Blob([csv], { type: "text/plain;charset=utf-8" });
        saveAs(blob, "BarcodeScanningHistory.csv");
    };

    me.playAudio = function() {
        try {
            if (document.querySelector('.toggle-sound').innerHTML.trim() === '🔇') return;
            let audio = document.getElementById('audio');
            audio.currentTime = 0;
            audio.play();
        } catch (error) {
            console.log(error);
        }
    };

    me.populateHistory = function() {
        let scans = me.data.scans || [];
        let thead = `
            <thead>
                <tr class="w3-black">
                    <th>Time</th>
                    <th>Data</th>
                    <th><button type="button" class='clear-scans'>Clear</button></th>
                </tr>
            </thead>`;
        let tbody = ``;
        for (let i = scans.length - 1; i >= 0; i--) {
            let scan = scans[i];
            let d = new Date(scan.timestamp);
            let timestamp = d.getFullYear() + '-' 
                + d.getMonth().toString().padStart(2, '0') + '-' 
                + d.getDate().toString().padStart(2, '0') + ' ' 
                + d.getHours().toString().padStart(2, '0') + ':' 
                + d.getMinutes().toString().padStart(2, '0') + ':' 
                + d.getSeconds().toString().padStart(2, '0') + '.' 
                + d.getMilliseconds().toString().padStart(3, '0');
            tbody += `
                <tr index="` + i.toString() + `">
                    <td>` + timestamp + `</td>
                    <td>` + scan.text + `</td>
                    <td><button type="button" class="clear-scan">Remove</button></td>
                </tr>`;
        }
        tbody = `<tbody>` + tbody + `</tbody>`;
        let table = `<table class="w3-table-all w3-hoverable">` + thead + tbody + `</table>`;
        if (me.historyTable) me.historyTable.destroy();
        document.querySelector('div.history-area').innerHTML = `
            <p class="w3-center">
                <button type="button" class="export-scans">Download Spreadsheet</button>
            </p>` + table;
        me.historyTable = new simpleDatatables.DataTable(document.querySelector('div.history-area table'), {
            perPageSelect: [5, 10, 15, 20, 25, 100000]
        });
    };

    me.startEventListeners = function() {
        document.querySelector('input[name="scan-input"]').addEventListener('scan', function(e) {
            me.addScan({
                text: e.detail.value,
                timestamp: new Date().getTime()
            });
        });

        document.querySelector('input[name="scan-input"]').addEventListener('blur', function (e) {
            let target = e.target;
            let maintainFocus = document.querySelector('input[name=maintainscanfocus]').checked;
            if (maintainFocus) {
                setTimeout(function () {
                    target.focus();
                }, 20);
            }
        });

        document.addEventListener('click', me.onClickHandler);
        document.addEventListener('change', me.onChangeHandler);
    };

    me.init();
}
var barcodeScanning = new BarcodeScanning();