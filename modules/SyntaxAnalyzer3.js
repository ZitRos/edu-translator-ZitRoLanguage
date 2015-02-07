var SyntaxAnalyzer3 = function () {

    this.LEX_CODES_SWAP = {
        34: "$ID",
        35: "$CONST"
    };

    this.AXIOM = "<program>";

    /**
     * @type {{rule: string[][]}}
     */
    this.rules = {
        "<program>": [
            ["module", "$ID", "{", "var", "<idList1>", "start", "<operatorList1>", "end", "}"]
        ],
        "<operatorList1>": [
            ["<operatorList>"]
        ],
        "<operatorList>": [
            ["<operator>"],
            ["<operatorList>", ";", "<operator>"]
        ],
        "<idList1>": [
            ["<idList>"]
        ],
        "<idList>": [
            [":", "$ID"],
            ["<idList>", ",", "$ID"]
        ],
        "<operator>": [
            ["input", "<idList1>"],
            ["output", "<idList1>"],
            ["$ID", "=", "<expression1>"],
            ["do", "$ID", "=", "<expression1>", "to", "<expression1>", "by", "<expression1>",
                "while", "<logicalExpression1>", "<operatorList1>", "end"],
            ["if", "<logicalExpression1>", "then", "<operator>"]
        ],
        "<expression1>": [
            ["<expression>"]
        ],
        "<expression2>": [
            ["<expression1>"]
        ],
        "<expression>": [
            ["<expression>", "+", "<terminal1>"],
            ["<expression>", "-", "<terminal1>"],
            ["<terminal1>"]
        ],
        "<terminal1>": [
            ["<terminal>"]
        ],
        "<terminal>": [
            ["<terminal>", "*", "<multiplier1>"],
            ["<terminal>", "/", "<multiplier1>"],
            ["<multiplier1>"]
        ],
        "<multiplier1>": [
            ["<multiplier>"]
        ],
        "<multiplier>": [
            ["<multiplier>", "^", "<basicExpression>"],
            ["<basicExpression>"]
        ],
        "<basicExpression>": [
            ["(", "<expression2>", ")"],
            ["$ID"],
            ["$CONST"]
        ],
        "<logicalExpression1>": [
            ["<logicalExpression>"]
        ],
        "<logicalExpression>": [
            ["<logicalExpression>", "or", "<logicalTerminal1>"],
            ["<logicalTerminal1>"]
        ],
        "<logicalTerminal1>": [
            ["<logicalTerminal>"]
        ],
        "<logicalTerminal>": [
            ["<logicalTerminal>", "and", "<logicalMultiplier1>"],
            ["<logicalMultiplier1>"]
        ],
        "<logicalMultiplier1>": [
            ["<logicalMultiplier>"]
        ],
        "<logicalMultiplier>": [
            ["[", "<logicalExpression1>", "]"],
            ["<expression1>", "<=", "<expression1>"],
            ["<expression1>", ">=", "<expression1>"],
            ["<expression1>", "==", "<expression1>"],
            ["<expression1>", "!=", "<expression1>"],
            ["<expression1>", "<", "<expression1>"],
            ["<expression1>", ">", "<expression1>"],
            ["not", "<logicalMultiplier1>"]
        ]
    };

};

SyntaxAnalyzer3.prototype.check = function (translation) {

    var _ = this,
        objectTable = {},
        htmlTable = [],
        END_SYMBOL = "#",
        EXIT_RELATION = "#";
        //leftEqualities = [],
        //leftLastPluses = {},
        //rightEqualities = [],
        //rightLastPluses = {};

    var isRule = function (s) { return s ? !!s.match(/^<\w+>$/) : false; };
        //isNotRule = function (s) { return s ? !isRule(s) : false },
        //isClass = function (s) { return s ? !!s.match(/^\$\w+$/) : false; };

    var setExpression = function (leftLex, rightLex, expression) {

        if (typeof objectTable[leftLex] === "undefined") {
            console.error("Unable to set expression \"%s\" between \"%s\" and \"%s\" Lexeme \"%s\" is not defined.",
                expression, leftLex, rightLex, leftLex);
            return;
        }

        if (!objectTable[leftLex][rightLex] || objectTable[leftLex][rightLex] === expression) {
            objectTable[leftLex][rightLex] = expression;
        } else {
            console.error("Conflicting \"%s\" and \"%s\": expression \"%s\" is not going to be changed to \"%s\".",
                leftLex, rightLex, objectTable[leftLex][rightLex], expression);
        }

    };

    /**
     * @param {string} rule
     * @param {boolean} first
     * @param {object} [exclude]
     */
    var getFirstLast = function (rule, first, exclude) {

        var i, j, k, el, obj = {};

        if (!exclude) exclude = {};
        if (isRule(rule)) {
            for (i in _.rules[rule]) { // _.rules[rule][i] is string[]
                if (isRule(el = _.rules[rule][i][first ? 0 : _.rules[rule][i].length - 1])) {
                    obj[el] = true;
                    if (!exclude.hasOwnProperty(el)) {
                        exclude[el] = true;
                        for (j in k = getFirstLast(el, first, exclude)) {
                            obj[j] = true;
                        }
                    }
                } else {
                    obj[el] = true;
                }
            }
        }

        return obj;

    };

    var fillExpressions = function (leftLex, rightLex) {

        var lex, last, lastPlus, firstPlus,
            a = isRule(leftLex),
            b = isRule(rightLex);

        if (a && !b) {
            for (lex in lastPlus = getFirstLast(leftLex, false)) {
                setExpression(lex, rightLex, ">");
            }
        } else if (!a && b) {
            for (lex in firstPlus = getFirstLast(rightLex, true)) {
                setExpression(leftLex, lex, "<");
            }
        } else if (a && b) {
            for (last in lastPlus = getFirstLast(leftLex, false)) {
                for (lex in firstPlus = getFirstLast(rightLex, true)) {
                    //console.log("setting",last,lex, leftLex);
                    setExpression(last, lex, ">");
                }
            }
            for (lex in firstPlus) {
                setExpression(leftLex, lex, "<");
            }
        }

    };

    (function fillObjectTable() { // fills objectTable

        var everything = {};

        var recursiveFill = function (obj) {
            for (var i in obj) {
                if (!everything.hasOwnProperty(obj[i])) {
                    everything[i] = true;
                }
                for (var j in obj[i]) { // obj[i] instanceof Array
                    for (var k in obj[i][j]) { // obj[i][j] instanceof Array
                        if (!everything.hasOwnProperty(obj[i][j][k])) {
                            everything[obj[i][j][k]] = true;
                        }
                    }
                }
            }
            everything[END_SYMBOL] = true;
        };

        recursiveFill(_.rules);

        for (var i in everything) {
            objectTable[i] = (function () {
                var obj = {};
                for (var j in everything) {
                    if (j === i && i === END_SYMBOL) {
                        obj[j] = EXIT_RELATION;
                    } else if (i === END_SYMBOL) {
                        obj[j] = "<";
                    } else if (j === END_SYMBOL) {
                        obj[j] = ">";
                    } else {
                        obj[j] = "";
                    }
                }
                return obj;
            })();
        }

    })();

    (function fillEqualities () {
        for (var i in _.rules) {
            for (var j in _.rules[i]) {
                for (var k = 0; k < _.rules[i][j].length - 1; k++) {
                    setExpression(_.rules[i][j][k], _.rules[i][j][k + 1], "=");
                    fillExpressions(_.rules[i][j][k], _.rules[i][j][k + 1]);
                }
            }
        }
    })();

    //(function findLeftEqualities() {
    //    var i, rec = function (obj) {
    //        if (obj instanceof Array) {
    //            if (obj[0] instanceof Array) {
    //                for (i in obj) rec(obj[i]);
    //            } else if (typeof obj[0] === "string") {
    //                obj.map(function (element, index, obj) {
    //                    if (isRule(element) && isNotRule(obj[index + 1])
    //                        || isRule(element) && isRule(obj[index + 1])
    //                        || isNotRule(element) && isNotRule(obj[index + 1])) {
    //                        leftEqualities.push({ left: element, right: obj[index + 1] });
    //                        objectTable[element][obj[index + 1]] = "=";
    //                    }
    //                });
    //            } else {
    //                console.error("Malformed rule detected.");
    //            }
    //        } else if (typeof obj === "object") { // malformed rules protector
    //            for (i in obj) rec(obj[i]);
    //        } else {
    //            console.error("Malformed rule detected.");
    //        }
    //    };
    //    rec(_.rules);
    //})();
    //
    //(function findLastPlus() {
    //    var rec = function (obj, symbol) {
    //        if (obj instanceof Array) {
    //            if (obj[0] instanceof Array) {
    //                for (var i in obj) rec(obj[i], symbol);
    //            } else if (typeof obj[0] === "string") {
    //                if (isRule(obj[obj.length - 1])) {
    //                    if (!leftLastPluses.hasOwnProperty(/*_.rules[*/obj[obj.length - 1]/*]*/)) { // limit
    //                        leftLastPluses[obj[obj.length - 1]] = symbol;
    //                        rec(_.rules[obj[obj.length - 1]], symbol);
    //                    }
    //                } else {
    //                    leftLastPluses[obj[obj.length - 1]] = symbol;
    //                }
    //            } else {
    //                console.error("Malformed code detected. (4.1)");
    //            }
    //        } else {
    //            //console.error("Malformed code detected. (3.1)");
    //        }
    //    };
    //    for (var i in leftEqualities) {
    //        leftLastPluses = {};
    //        rec(_.rules[leftEqualities[i].left], leftEqualities[i].right);
    //        for (var j in leftLastPluses) {
    //            if (!objectTable[j][leftLastPluses[j]] || objectTable[j][leftLastPluses[j]] === ">") {
    //                objectTable[j][leftLastPluses[j]] = ">";
    //            } else {
    //                objectTable[j][leftLastPluses[j]] += " >";
    //                console.info("Conflict at: ", objectTable[j][leftLastPluses[j]], " --> ", ">", j, i);
    //            }
    //        }
    //    }
    //})();
    //
    //// duplicate because I want to sleep
    //
    //(function findRightEqualities() {
    //    var i, rec = function (obj) {
    //        if (obj instanceof Array) {
    //            if (obj[0] instanceof Array) {
    //                for (i in obj) rec(obj[i]);
    //            } else if (typeof obj[0] === "string") {
    //                obj.map(function (element, index, obj) {
    //                    if (isRule(element) && isNotRule(obj[index - 1])
    //                        || isRule(element) && isRule(obj[index - 1])
    //                        || isNotRule(element) && isNotRule(obj[index - 1])) {
    //                        rightEqualities.push({ left: obj[index - 1], right: element });
    //                        objectTable[obj[index - 1]][element] = "=";
    //                    }
    //                });
    //            } else {
    //                console.error("Malformed rule detected. (1)");
    //            }
    //        } else if (typeof obj === "object") { // malformed rules protector
    //            for (i in obj) rec(obj[i]);
    //        } else {
    //            console.error("Malformed rule detected. (2)");
    //        }
    //    };
    //    rec(_.rules);
    //})();
    //
    //(function findFirstPlus() {
    //    var rec = function (symbol, obj) {
    //        if (obj instanceof Array) { // obj instanceof array
    //            if (obj[0] instanceof Array) {
    //                for (var i in obj) rec(symbol, obj[i]);
    //            } else if (typeof obj[0] === "string") {
    //                if (isRule(obj[0])) {
    //                    if (!rightLastPluses.hasOwnProperty(obj[0])) { // limit
    //                        rightLastPluses[obj[0]] = symbol;
    //                        rec(symbol, _.rules[obj[0]]);
    //                    }
    //                } else {
    //                    rightLastPluses[obj[0]] = symbol;
    //                }
    //            } else {
    //                console.error("Malformed code detected. (4)");
    //            }
    //        } else {
    //            //console.error("Malformed code detected. (3)");
    //        }
    //    };
    //    for (var i in rightEqualities) {
    //        rightLastPluses = {};
    //        rec(rightEqualities[i].left, _.rules[rightEqualities[i].right]);
    //        for (var j in rightLastPluses) {
    //            //objectTable[rightLastPluses[j]][j] = "<";
    //            if (!objectTable[rightLastPluses[j]][j] || objectTable[rightLastPluses[j]][j] === "<") {
    //                objectTable[rightLastPluses[j]][j] = "<";
    //            } else {
    //                objectTable[rightLastPluses[j]][j] += " <";
    //                console.info("Conflict at: ", objectTable[rightLastPluses[j]][j], " --> ", "<", j, i);
    //            }
    //        }
    //    }
    //})();

    var normalizeName = function (name) {
        var r = function (s) { return s.replace(/</g, "&lt;");};
        if (name.match(/^[<>=]$/)) {
            return "<b>" + r(name) + "</b>";
        } else return r(name);
    };

    htmlTable.push("<div style=\"overflow: auto;\"><table class=\"little noPadding\"><thead>");
    (function fillHTMLTable() {

        var i, j;

        htmlTable.push("<tr><th></th>");
        for (i in objectTable) {
            htmlTable.push("<th>" + normalizeName(i) + "</th>");
        }
        htmlTable.push("</tr></thead><tbody>");

        for (i in objectTable) {
            htmlTable.push("<tr><th>" + normalizeName(i) + "</th>");
            for (j in objectTable) {
                htmlTable.push("<td>" + normalizeName(objectTable[i][j]) + "</td>");
            }
            htmlTable.push("</tr>");
        }

    })();
    htmlTable.push("</tbody></table></div>");

    // expressions set here, using objectTable variable.

    //noinspection JSCheckFunctionSignatures
    var lexemes = translation.lexemes.slice().concat({ lexeme: END_SYMBOL, code: -1, position: {row: -1, column: -1} }),
        lexeme = null,
        stackTop,
        relation,
        tempLexeme,
        stackPart,
        rule,
        len,
        iterations = 0,
        stack = [{ lexeme: END_SYMBOL, code: -1, position: {row: -1, column: -1} }];

    var arraysEqual = function (a, b) {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (a.length != b.length) return false;

        // If you don't care about the order of the elements inside
        // the array, you should sort both arrays here.

        for (var i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    };

    /**
     * @param {Array} stackPart
     */
    var getRuleFromStackPart = function (stackPart) {

        for (var i in _.rules) {
            for (var j in _.rules[i]) {
                if (arraysEqual(_.rules[i][j], stackPart.map(function (el) { return el.lexeme; }))) {
                    return i;
                }
            }
        }

        return false;

    };

    var nullObj = function () {
        this.html = htmlTable.concat("</tbody></table></div>").join("");
        this.error = "An error occurred during syntax analyzing.";
    };

    var normalizeLexeme = function (lexeme) {
        var lex, o;
        if (!lexeme.lexeme) { console.log("Unknown lexeme cannot be normalized:", lexeme); }
        if (_.LEX_CODES_SWAP.hasOwnProperty(lexeme.code)) {
            lex = _.LEX_CODES_SWAP[lexeme.code];
        } else {
            lex = lexeme.lexeme;
        }
        o = {
            lexeme: lex,
            code: lexeme.code,
            position: lexeme.position
        };
        if (lex !== lexeme.lexeme) { o.originLexeme = lexeme.lexeme; }
        return o;
    };

    htmlTable.push("<h1>Syntax parse log</h1><div style=\"overflow: auto;\"><table style=\"white-space: nowrap;\">" +
    "<thead><tr><th>Step</th><th>Stack</th><th>Relation</th><th>Chain</th></tr></thead><tbody>");

    while (lexemes.length > 0) {
        if (this.LEX_CODES_SWAP.hasOwnProperty(lexemes[0].code)) {
            lexeme = this.LEX_CODES_SWAP[lexemes[0].code];
        } else {
            lexeme = lexemes[0].lexeme;
        }
        stackTop = stack[stack.length - 1];
        relation = objectTable[stackTop.lexeme][lexeme];
        //console.error(lexeme, "|||", stackTop, "|||", relation, "\n\n");
        htmlTable.push("<tr><td>", iterations ,"</td><td style=\"text-align: right\">",
            normalizeName(stack.map(function (el) { return el.lexeme; }).join(" ")), "</td><td>",
            normalizeName(relation), "</td><td style=\"text-align: left;\">",
            normalizeName(lexemes.map(function (el) { return el.lexeme; }).join(" ")) ,"</td></tr>");
        if (lexemes.length < 2 && stackTop.lexeme === this.AXIOM) {
            htmlTable.push("<tr><td>", ++iterations ,"</td><td style=\"text-align: right; color: green;\">",
                "Code", "</td><td style=\"color: green;\">",
                "is", "</td><td style=\"text-align: left; color: green;\">",
                "clean!" ,"</td></tr>");
            break;
        }
        if (relation === "<") {
            tempLexeme = lexemes.splice(0, 1)[0];
            stack.push(normalizeLexeme(tempLexeme));
        } else if (relation === ">") {
            len = (function () {
                for (var i = stack.length - 1; i > 0; i--) {
                    if (objectTable[stack[i-1].lexeme][stack[i].lexeme] === "<") {
                        return stack.length - i;
                    }
                }
                return stack.length - 1;
            })();
            stackPart = stack.splice(stack.length - len, len);
            rule = getRuleFromStackPart(stackPart);
            if (!rule) {
                console.error("Rule for", stackPart, "not found. Base len:", len);
                htmlTable.push("<tr><td class=\"errorLeft\" colspan='4'>Rule with the right part [",
                    stackPart.map(function (el) { return "\"<i>" + normalizeName(el.lexeme) + "</i>\""; }).join(", "),
                    "] is not set (" + stackPart[stackPart.length - 1].position.row + ", " + stackPart[stackPart.length - 1].position.column + ")</td></tr>");
                return new nullObj();
            }
            stack.push({ lexeme: rule, code: -1, position: stackPart[stackPart.length - 1].position });
        } else if (relation === "=") {
            tempLexeme = lexemes.splice(0, 1)[0];
            stack.push(normalizeLexeme(tempLexeme));
        } else {
            console.error("Parse error: unknown relation %s <-\"%s\"-> %s.", stackTop.lexeme, relation, lexeme);
            htmlTable.push("<tr><td class=\"errorLeft\" colspan='4'>Unknown relation \"", stackTop.lexeme,
                "\" <-", normalizeName(relation), "-> \"", lexeme,
                "\" (" + stackTop.position.row + ", " + stackTop.position.column + ")</td></tr>");
            return new nullObj();
        }
        iterations++;
    }

    htmlTable.push("</tbody></table></div>");

    return {
        html: htmlTable.join(""),
        error: null
    };

};

module.exports = SyntaxAnalyzer3;