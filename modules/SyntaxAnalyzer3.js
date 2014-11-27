var SyntaxAnalyzer3 = function () {

    this.rules = {
        "<program>": ["module", "$ID", ";", "var", "<idList1>", ";", "start", "<operatorList1>",
            ";", "end", ";"],
        "<operatorList1>": ["<operatorList>"],
        "<operatorList>": [
            ["<operator1>"],
            ["<operatorList>", ";", "<operator1>"]
        ],
        "<idList1>": ["<idList>"],
        "<idList>": [
            ["$ID"],
            ["<idList>", ",", "$ID"]
        ],
        "<operator1>": ["<operator>"],
        "<operator>": [
            ["input", "<idList1>"],
            ["output", "<idList1>"],
            ["$ID", "=", "<expression1>"],
            ["do", "$ID", "=", "<expression1>", "to", "<expression1>", "by", "<expression1>",
                "while", "(", "<logicalExpression1>", ")", "<operatorList1>", ";", "end"],
            ["if", "<logicalExpression1>", "then", "<operator1>"]
        ],
        "<expression1>": ["<expression>"],
        "<expression>": [
            ["<expression>", "+", "<terminal1>"],
            ["<expression>", "-", "<terminal1>"],
            ["<terminal1>"]
        ],
        "<terminal1>": ["<terminal>"],
        "<terminal>": [
            ["<terminal>", "*", "<multiplier1>"],
            ["<terminal>", "/", "<multiplier1>"],
            ["<multiplier1>"]
        ],
        "<multiplier1>": ["<multiplier>"],
        "<multiplier>": [
            ["<multiplier>", "^", "<basicExpression>"],
            ["<basicExpression>"]
        ],
        "<basicExpression>": [
            ["(", "<expression1>", ")"],
            ["$ID"],
            ["$CONST"]
        ],
        "<logicalExpression1>": ["<logicalExpression>"],
        "<logicalExpression>": [
            ["<logicalExpression>", "or", "<logicalTerminal1>"],
            ["<logicalTerminal1>"]
        ],
        "<logicalTerminal1>": ["<logicalTerminal>"],
        "<logicalTerminal>": [
            ["<logicalTerminal", "and", "<logicalMultiplier1>"],
            ["<logicalMultiplier1>"]
        ],
        "<logicalMultiplier1>": ["<logicalMultiplier>"],
        "<logicalMultiplier>": [
            ["[", "<logicalExpression1>", "]"],
            ["<expression1>", "<logicalSign>", "<expression1>"],
            ["not", "<logicalMultiplier1>"]
        ],
        "<logicalSign>": ["<", "<=", ">", ">=", "==", "!="]
    };

};

SyntaxAnalyzer3.prototype.check = function () {

    var _ = this,
        objectTable = {},
        htmlTable = ["<div style=\"overflow: auto;\"><table class=\"little noPadding\"><thead>"],
        leftEqualities = [],
        leftLastPluses = {},
        rightEqualities = [],
        rightLastPluses = {};

    var isRule = function (s) { return s ? !!s.match(/^<\w+>$/) : false; },
        isNotRule = function (s) { return s ? !isRule(s) : false },
        isClass = function (s) { return s ? !!s.match(/^\$\w+$/) : false; };

    (function fillObjectTable() {

        var everything = {};

        var recursiveFill = function (obj) {
            for (var i in obj) {
                if (!(obj instanceof Array) && typeof obj === "object"
                    && !everything.hasOwnProperty(i)) {
                    everything[i] = true;
                }
                if (obj[i] instanceof Array) {
                    recursiveFill(obj[i])
                } else if (!everything.hasOwnProperty(obj[i])) {
                    everything[obj[i]] = true;
                }
            }
        };

        recursiveFill(_.rules);

        for (var i in everything) {
            objectTable[i] = (function () {
                var obj = {};
                for (var i in everything) obj[i] = "";
                return obj;
            })();
        }

    })();

    (function findLeftEqualities() {
        var i, rec = function (obj) {
            if (obj instanceof Array) {
                if (obj[0] instanceof Array) {
                    for (i in obj) rec(obj[i]);
                } else if (typeof obj[0] === "string") {
                    obj.map(function (element, index, obj) {
                        if (isRule(element) && isNotRule(obj[index + 1])) {
                            leftEqualities.push({ left: element, right: obj[index + 1] });
                            objectTable[element][obj[index + 1]] = "=";
                        }
                    });
                } else {
                    console.error("Malformed rule detected.");
                }
            } else if (typeof obj === "object") { // malformed rules protector
                for (i in obj) rec(obj[i]);
            } else {
                console.error("Malformed rule detected.");
            }
        };
        rec(_.rules);
    })();

    (function findLastPlus() {
        var rec = function (obj, symbol) {
            if (obj instanceof Array) { // obj instanceof array
                if (obj[0] instanceof Array) {
                    for (var i in obj) rec(obj[i], symbol);
                } else if (typeof obj[0] === "string") {
                    if (isRule(obj[obj.length - 1])) {
                        if (!leftLastPluses.hasOwnProperty(/*_.rules[*/obj[obj.length - 1]/*]*/)) { // limit
                            leftLastPluses[obj[obj.length - 1]] = symbol;
                            rec(_.rules[obj[obj.length - 1]], symbol);
                        }
                    } else {
                        leftLastPluses[obj[obj.length - 1]] = symbol;
                    }
                } else {
                    console.error("Malformed code detected...");
                }
            } else {
                console.error("Malformed code detected.");
            }
        };
        for (var i in leftEqualities) {
            leftLastPluses = {};
            rec(_.rules[leftEqualities[i].left], leftEqualities[i].right);
            for (var j in leftLastPluses) {
                //if (!objectTable[j][leftLastPluses[j]] || objectTable[j][leftLastPluses[j]] === ">") {
                    objectTable[j][leftLastPluses[j]] = ">";
                //} else {
                //    console.info("Possibly wrong algorithm.");
                //}
            }
        }
    })();

    // duplicate because I want to sleep

    (function findRightEqualities() {
        var i, rec = function (obj) {
            if (obj instanceof Array) {
                if (obj[0] instanceof Array) {
                    for (i in obj) rec(obj[i]);
                } else if (typeof obj[0] === "string") {
                    obj.map(function (element, index, obj) {
                        if (isRule(element) && isNotRule(obj[index - 1])) {
                            rightEqualities.push({ left: obj[index - 1], right: element });
                            objectTable[obj[index - 1]][element] = "=";
                        }
                    });
                } else {
                    console.error("Malformed rule detected.");
                }
            } else if (typeof obj === "object") { // malformed rules protector
                for (i in obj) rec(obj[i]);
            } else {
                console.error("Malformed rule detected.");
            }
        };
        rec(_.rules);
    })();

    (function findFirstPlus() {
        var rec = function (symbol, obj) {
            if (obj instanceof Array) { // obj instanceof array
                if (obj[0] instanceof Array) {
                    for (var i in obj) rec(symbol, obj[i]);
                } else if (typeof obj[0] === "string") {
                    if (isRule(obj[0])) {
                        if (!rightLastPluses.hasOwnProperty(obj[0])) { // limit
                            rightLastPluses[obj[0]] = symbol;
                            rec(symbol, _.rules[obj[0]]);
                        }
                    } else {
                        rightLastPluses[obj[0]] = symbol;
                    }
                } else {
                    console.error("Malformed code detected...");
                }
            } else {
                console.error("Malformed code detected.");
            }
        };
        for (var i in rightEqualities) {
            rightLastPluses = {};
            rec(rightEqualities[i].left, _.rules[rightEqualities[i].right]);
            for (var j in rightLastPluses) {
                objectTable[j][rightLastPluses[j]] = "<";
            }
        }
    })();

    (function fillHTMLTable() {

        var i, j;

        var normalizeName = function (name) {
            var r = function (s) { return s.replace(/</g, "&lt;");}, t;
            //if (name.match(/^<\w+>$/)) {
            //    return "<b><i>" + r((t = name.match(/\w+/).toString()).substr(0, 4) + (t.length > 4 ? "…" + t.substr(t.length - 2, 2) : "")) + "</b></i>";
            //} else if (name.match(/^$\w+$/)) {
            //    return "<i>" + r((t = name.match(/\w+/).toString()).substr(0, 4) + (t.length > 4 ? "…" + t.substr(t.length - 2, 2) : "")) + "</i>";
            //} else {
            if (name.match(/^[<>=]$/)) {
                return "<b>" + r(name) + "</b>";
            } else return r(name);
            //}
        };

        htmlTable.push("<tr><th></th>");
        for (i in objectTable) {
            htmlTable.push("<th>" + normalizeName(i) + "</th>");
        }
        htmlTable.push("<th>#</th></tr></thead><tbody>");

        for (i in objectTable) {
            htmlTable.push("<tr><th>" + normalizeName(i) + "</th>");
            for (j in objectTable) {
                htmlTable.push("<td>" + normalizeName(objectTable[i][j]) + "</td>");
            }
            htmlTable.push("<th>&gt;</th></tr>");
        }

        htmlTable.push("<tr><th>#</th>");
        for (i in objectTable) {
            htmlTable.push("<td>&lt;</td>");
        }
        htmlTable.push("<td></td></tr>");

    })();

    htmlTable.push("</tbody></table></div>");

    return {
        error: "Not implemented",
        html: htmlTable.join("")
    };

};

module.exports = SyntaxAnalyzer3;