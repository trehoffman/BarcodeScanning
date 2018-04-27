function Scanner() {
    this.scanner_inputs = [];
    this.scanner_histories = [];
    this.scan_clear_buttons = [];
    this.scans = [];

    this.init = function () {
        var _scanner = this;
        this.loadScans();

        this.scanner_inputs = document.querySelectorAll("input.scan-input");
        this.scanner_histories = document.querySelectorAll("table.scan-history tbody");
        this.scan_clear_buttons = document.querySelectorAll('button.clear-scans');

        this.scanner_inputs.forEach(function (elem) {
            elem.addEventListener("keypress", function (e) {
                var _this = this;
                var val = _this.value;

                if (e.keyCode === 13) { //enter pressed
                    var scan = {
                        text: val,
                        timestamp: new Date().getTime()
                    };
                    _scanner.addScan(scan);
                    _this.value = "";
                }
            });
        });

        this.scan_clear_buttons.forEach(function (elem) {
            elem.addEventListener('click', function (e) {
                _scanner.clearScans();
            });
        });

        document.addEventListener('click', function (e) {
            if (e.target.classList.contains('remove-scan')) {
                var index = parseInt(e.target.getAttribute('index'));
                var scan = _scanner.getScan(index);
                _scanner.removeScan(scan);
            }
        });
    };

    this.getScan = function (index) {
        var _this = this;
        var scans = _this.scans;
        return scans[index];
    };

    this.addScan = function (scan) {
        this.scans.push(scan);
        this.setScans();
    };

    this.removeScan = function (scan_to_remove) {
        var _this = this;
        var scans = _this.scans;

        for (var i = scans.length - 1; i >= 0; i--) {
            var scan = scans[i];
            if (scan == scan_to_remove) {
                scans.splice(i, 1);
            }
        }
        _this.scans = scans;
        _this.putScans();
    };

    this.putScans = function () {
        var scanner_histories = this.scanner_histories;
        scanner_histories.forEach(function (elem) {
            elem.innerHTML = "";
        });
        this.scans.forEach(function (scan, index) {
            scanner_histories.forEach(function (elem) {
                elem.innerHTML += '<tr>'
                    + '<td>' + scan.timestamp + '</td>'
                    + '<td>' + scan.text + '</td>'
                    + '<td>' + '<button type="button" class="remove-scan" index="' + index + '">Remove</button>' + '</td>'
                    + '</tr>';
            });
        });
    };

    this.loadScans = function () {
        var _this = this;
        localforage.getItem("scans").then(function (value) {
            console.log("loadScans done");
            console.log(value);
            if (!value) {
                _this.scans = [];
            } else {
                _this.scans = value;
            }
            _this.putScans();
        });
    };

    this.setScans = function () {
        var _this = this;
        var scans = _this.scans;
        localforage.setItem("scans", scans).then(function (value) {
            console.log("setScans done");
            _this.putScans();
        });
    };

    this.clearScans = function () {
        var _this = this;
        _this.scans = [];
        _this.setScans();
    };
}