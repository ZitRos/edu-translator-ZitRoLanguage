var fs = require("fs");

/**
 * @param {*} string
 * @returns {string}
 */
var escape = function (string) {
    return (string || "").toString().replace(/&(?!\w+;)/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
};

var LexicalAnalyzer = function () {

    this.lexem = {
        "module":   1,
        "var":      2,
        "start":    3,
        "end":      4,
        "do":       5,
        "to":       6,
        "by":       7,
        "while":    8,
        "if":       9,
        "then":     10,
        "input":    11,
        "output":   12,
        "or":       13,
        "and":      14,
        "not":      15,
        ";":        16,
        ",":        17,
        "=":        18,
        "+":        19,
        "-":        20,
        "*":        21,
        "/":        22,
        "(":        23,
        ")":        24,
        "[":        25,
        "]":        26,
        ">":        27,
        "<":        28,
        ">=":       29,
        "<=":       30,
        "==":       31,
        "!=":       32,
        "^":        33,
//      ID          34
//      CONST       35
        "{":        36,
        "}":        37,
        ":":        38
    };

    this.class = {
        "letter": /[a-zA-Z]/,
        "digit": /[0-9]/,
        "separator": /[;,\{}\+\-\*\/\(\)\[\]\^:]/,
        "equality": /[=]/,
        "lessThen": /[<]/,
        "greaterThen": /[>]/,
        "notEqual": /[!]/
    }

};

/**
 * @param {string} symbol
 * @returns {null|string}
 */
LexicalAnalyzer.prototype.getSymbolClass = function (symbol) {

    var i;

    if (typeof symbol !== "string") return null;

    for (i in this.class) {
        if (symbol.match(this.class[i]))
            return i;
    }

    return null;

};

/**
 * @private
 */
LexicalAnalyzer.prototype._nextState = function (state, sClass) {

    var _this = this;

    var def = function (lexeme) {
        return { lexeme: lexeme, code: _this.lexem[lexeme] };
    };

    var states = {
        1: {
            "letter": 2,
            "digit": 3,
            "separator": function (lexeme) {
                return { lexeme: lexeme, code: _this.lexem[lexeme] }
            },
            "lessThen": 4,
            "greaterThen": 5,
            "equality": 6,
            "notEqual": 7,
            "": function () {
                return { error: 1 }
            }
        },
        2: {
            "letter": 2,
            "digit": 2,
            "": function (lexeme) {
                if (_this.lexem.hasOwnProperty(lexeme)) {
                    return { lexeme: lexeme, code: _this.lexem[lexeme] }
                } else {
                    return { lexeme: lexeme, code: 34 }
                }
            }
        },
        3: {
            "digit": 3,
            "": function (lexeme) { return { lexeme: lexeme, code: 35 } }
        },
        4: { // <=
            "equality": function () {
                return { lexeme: "<=", code: _this.lexem["<="] };
            },
            "": function (lexeme) {
                return def(lexeme);
            }
        },
        5: { // >=
            "equality": function () {
                return { lexeme: ">=", code: _this.lexem[">="] };
            },
            "": function (lexeme) {
                return def(lexeme);
            }
        },
        6: { // ==
            "equality": function () {
                return { lexeme: "==", code: _this.lexem["=="] };
            },
            "": function (lexeme) {
                return def(lexeme);
            }
        },
        7: { // !=
            "equality": function () {
                return { lexeme: "!=", code: _this.lexem["!="] };
            },
            "": function () {
                return { error: 1 };
            }
        }
    };

    return states[state][sClass] || states[state][""] || 0;
    /*{
        ok: true,
        state: states[state][sClass] || 0,
        lexeme: ""
    }*/

};

/**
 * @param {string} string - String, where lexeme will be found.
 * @returns {Array}
 */
LexicalAnalyzer.prototype.getLexemesTable = function (string) {

    var i, sClass, state, stack, nextState, res, temp,
        row = 1, column = 1,
        table = [],
        goose = false;

    string += " ";

    for (i = 0; i < string.length; i++) {

        while ((string[i] || "").match(/[\s]/)) {
            if (string[i] === "\n") { row++; column = i; }
            i++;
        }
        state = 1;
        stack = "";

        while (i < string.length) {
            sClass = this.getSymbolClass(string[i]);
            nextState = this._nextState(state, sClass);
            //console.log(string[i], stack, state);
            if (typeof nextState === "function") {
                if (stack === "") {
                    stack = string[i];
                } else {
                    if (goose) {
                        i++;
                    }
                    i--;
                    goose = false;
                }
                res = nextState(stack);
                if (!res.error) {
                    res.position = {
                        row: row,
                        column: i + ( row === 1 ? 3 : 1 ) - (res.lexeme || "").length - column
                    };
                    table.push(res);
                } else {
                    console.error("Unknown lexeme \"" + stack + "\" at (%d, %d).", row,
                            i + ( row === 1 ? 3 : 1 ) - (res.lexeme || "").length - column);
                    return [];
                }
                break;
            } else {

                stack += string[i];
                temp = string[i] + string[i + 1];

                // And now the goose will help us! Just call the goose!
                if (temp === "==") goose = true;
                if (temp === ">=") goose = true;
                if (temp === "<=") goose = true;
                if (temp === "!=") goose = true;

                state = nextState;
                i++;

            }
        }

    }

    return table;

};

/**
 *
 * @param {string} code - Program code.
 * @returns {{ lexemes: Object, IDs: Object, CONSTs: Object }}
 */
LexicalAnalyzer.prototype.parse = function (code) {

    var table,
        inVar = 0,
        IDs = {}, ids = 0,
        CONSTs = {}, consts = 0,
        n, i;

    // code = code.replace(/\s+/g, " "); // may be omitted

    table = this.getLexemesTable(code);

    var inside = function (obj, val) {

        var u;

        for (u in obj) {
            if (obj[u] === val) {
                return u;
            }
        }

        return false;

    };

    for (i in table) {

        if (inVar && table[i].lexeme === "start") inVar = 0;
        if (table[i].lexeme === "var") inVar = 1;

        if (table[i].code === 34) {
            //if (inVar) console.log(table[i]);
            if ((n = inside(IDs, table[i].lexeme)) !== false) {
                table[i].classCode = n;
            } else {
                if (!inVar && this.lexem[table[i-1].lexeme] !== 1) {
                    console.error("Variable \"" + table[i].lexeme + "\" (" + table[i].position.row +
                        ", " + table[i].position.column + ") is not defined.");
                    return {
                        error: {
                            message: "Variable \"" + table[i].lexeme + "\" (" + table[i].position.row +
                                ", " + table[i].position.column + ") is not defined."
                        },
                        lexemes: {},
                        IDs: {},
                        CONSTs: {}
                    };
                }
                if (this.lexem[table[i-1].lexeme] !== 1) {
                    IDs[++ids] = table[i].lexeme;
                    table[i].classCode = ids;
                }
            }
        } else if (table[i].code === 35) {
            if ((n = inside(CONSTs, table[i].lexeme)) !== false) {
                table[i].classCode = n;
            } else {
                CONSTs[++consts] = table[i].lexeme;
                table[i].classCode = consts;
            }
        }

    }

    return {
        lexemes: table,
        IDs: IDs,
        CONSTs: CONSTs
    };

};

LexicalAnalyzer.prototype.logHTML = function (programCode, filename, translation, otherInfo) {

    var i, temp;

    fs.appendFileSync(filename,
            "<html><head><title>ZitRoLang output</title><style>html,body {background: rgb(245, 255, 242)} " +
            "table thead { font-weight: 900; } " +
            "table td, table th { text-align: center; }" +
            "table {border-spacing: 0; border-collapse: collapse} table tr td, table tr th {border: " +
            "solid 1px black; padding: 0 5px 0 5px;} .noPadding * { padding: 1px !important; } " +
            ".little {font-size: 75%;} " +
            ".errorLeft {text-align: left; color: red; padding-left: 200px;} " +
            ".source { white-space: pre; font-family: monospace; }</style></head><body>" +
            "<div style=\"overflow: hidden;\"><div style=\"float: left; margin-right: 20px;\"><h1>Lexical analyzer</h1><hr/>" +
            "<table>" +
            "<thead>" +
            "<tr>" +
            "<td>Position</td><td>Substring</td><td>Code</td><td>Class No.</td>" +
            "</tr></thead><tbody>");

    for (i in translation.lexemes) {
        temp = translation.lexemes[i];
        fs.appendFileSync(filename, "<tr><td>(" + temp.position.row + ", " + temp.position.column
            + ")</td><td><b><i>" + escape(temp.lexeme) + "</i></b></td>" +
            "<td>" + escape(temp.code) + "</td><td>" + escape(temp.classCode || "") + "</td></tr>");
    }

    i = 1;
    temp = (programCode.match(/\n/g).length + 1 + "").length + 1;

    fs.appendFileSync(filename, "</tbody></table></div>" +
        "<div style=\"overflow: hidden\"><h1>Program code</h1><hr/>" +
        "<div class=\"source\">1 " + (new Array(temp - 1).join(" ")) + "| "
        + programCode.replace(/\n/g, function () { ++i; return "\n"
            + i.toString().concat(new Array(temp - i.toString().length).join(" ")) + " | "; })
        + "</div>" +
        "<h1>Tables</h1><hr/>" +
        "<div style=\"position: relative; overflow: hidden;\">" +
        "<table style=\"float: left; margin-right: 20px;\">" +
        "<thead>" +
        "<tr><td colspan=\"2\"><h1>Identifiers</h1></td></tr><tr>" +
        "<td>#</td><td>Name</td>" +
        "</tr></thead><tbody>");

    for (i in translation.IDs) {
        temp = translation.IDs[i];
        fs.appendFileSync(filename, "<tr><td>" + i + "</td><td>" + escape(temp) + "</td></tr>");
    }

    fs.appendFileSync(filename, "</tbody></table>");

    fs.appendFileSync(filename, "<table>" +
        "<thead>" +
        "<tr><td colspan=\"2\"><h1>Constants</h1></td></tr><tr>" +
        "<td>#</td><td>Constant</td>" +
        "</tr></thead><tbody>");

    for (i in translation.CONSTs) {
        temp = translation.CONSTs[i];
        fs.appendFileSync(filename, "<tr><td>" + i + "</td><td>" + escape(temp) + "</td></tr>");
    }

    fs.appendFileSync(filename, "</tbody></table>" +
        "</div><div>" + otherInfo + "</div>" +
        "</div></div></body></html>");

};

module.exports = LexicalAnalyzer;
