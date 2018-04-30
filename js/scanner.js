function Scanner() {
    this.scanner_inputs = [];
    this.scanner_histories = [];
    this.scan_clear_buttons = [];
    this.scans = [];
    this.sortField = 'timestamp';
    this.sortDirection = 'ASC';

    this.init = function () {
        var _scanner = this;

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
            } else if (e.target.classList.contains('sort')) {
                var context = _scanner.getContext();
                var sortField = e.target.getAttribute('sortField');
                var sortDirection = context.sortDirection;

                if ((typeof (sortDirection) == "undefined" || sortDirection == "" || sortDirection == "ASC") && (sortField == context.sortField)) {
                    sortDirection = "DESC";
                } else {
                    sortDirection = "ASC";
                }

                context.sortField = sortField;
                context.sortDirection = sortDirection;

                document.querySelectorAll('.sort-direction').forEach(function (elem) {
                    var parent = elem.parentElement;
                    var field = parent.getAttribute('sortField');
                    var direction = context.sortDirection;
                    if (field == context.sortField) {
                        if (direction == "ASC") {
                            elem.innerHTML = '&#9650;'
                        } else if (direction == "DESC") {
                            elem.innerHTML = '&#9660;'
                        }
                    } else {
                        elem.innerHTML = "";
                    }
                });

                _scanner.putScans();
            }
        });

        document.addEventListener('keyup', function (e) {
            if (e.target.classList.contains('filter')) {
                var value = e.target.value.toLowerCase();
                var rows = document.querySelectorAll('table.scan-history tbody tr');
                rows.forEach(function (item, index) {
                    var row_text = item.innerText.toLowerCase();
                    if (row_text.indexOf(value) > -1) {
                        item.style.display = "";
                    } else {
                        item.style.display = "none";
                    }
                });
            }
        });

        this.loadScans();
    };

    this.getContext = function () {
        return this;
    }

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
        var _this = this;
        _this.scans.sort(function (a, b) {
            var field = _this.sortField;
            var reverse = (_this.sortDirection == "DESC");
            if (field == "text") {
                var x = eval('a.' + field).toLowerCase();
                var y = eval('b.' + field).toLowerCase();
                if (reverse) {
                    if (x < y) { return 1; }
                    if (x > y) { return -1; }
                } else {
                    if (x < y) { return -1; }
                    if (x > y) { return 1; }
                }
                return 0;
            } else {
                var x = eval('a.' + field);
                var y = eval('b.' + field);

                if (reverse) {
                    return y - x;
                } else {
                    return x - y;
                }
            }
        });

        var table_body = '';
        _this.scans.forEach(function (scan, index) {
            var d = new Date(scan.timestamp);
            var timestamp = d.getFullYear() + '-' + d.getMonth().padLeft(2) + '-' + d.getDate().padLeft(2) + ' ' + d.getHours().padLeft(2) + ':' + d.getMinutes().padLeft(2) + ':' + d.getSeconds().padLeft(2) + '.' + d.getMilliseconds().padLeft(3);
            table_body += '<tr>'
                + '<td>' + timestamp + '</td>'
                + '<td>' + scan.text + '</td>'
                + '<td>' + '<button type="button" class="remove-scan" index="' + index + '">Remove</button>' + '</td>'
                + '</tr>';
        });

        _this.scanner_histories.forEach(function (elem) {
            elem.innerHTML = table_body;
        });
    };

    this.loadScans = function () {
        var _this = this;
        var value = localStorage.getItem("scans");
        if (!value) {
            _this.scans = [];
        } else {
            _this.scans = JSON.parse(value);
        }
        _this.putScans();
    };

    this.setScans = function () {
        var _this = this;
        var scans = _this.scans;
        localStorage.setItem("scans", JSON.stringify(scans));
        _this.putScans();
    };

    this.clearScans = function () {
        var _this = this;
        _this.scans = [];
        _this.setScans();
    };
}

Number.prototype.padLeft = function (n, str) {
    return Array(n - String(this).length + 1).join(str || '0') + this;
}