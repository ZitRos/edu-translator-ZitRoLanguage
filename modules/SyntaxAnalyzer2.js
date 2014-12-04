/**
 * PushDown automaton method.
 *
 * @constructor
 */
var SyntaxAnalyzer2 = function () {

    this.stack = [];

    var CODE_ID = 34,
        CODE_CONST = 35,

        stack = this.stack,
        nullSymb = function (state) { return { continue: state } },
        exit = function () { return { exit: true } },
        exitNullS = function () { return { exit: "nullSymbol" } },
        error = function (message) { return { error: message } };

    this.automaton = {

        "1-1": function (lex) { // program start
            return lex.lexeme === "module" ? "1-2" : error("Keyword \"program\" expected");
        },
        "1-2": function (lex) {
            return lex.code === CODE_ID ? "1-2.1" : error("Identifier expected");
        },
        "1-2.1": function (lex) {
            return lex.lexeme === "{" ? "1-3" : error("Symbol \"{\" expected");
        },
        "1-3": function (lex) {
            return lex.lexeme === "var" ? "1-4" : error("Keyword \"var\" expected");
        },
        "1-4": function (lex) {
            return lex.code === 34 ? "1-5" : error("Identifier expected");
        },
        "1-5": function (lex) {
            switch (lex.lexeme) {
                case ",": return "1-4"; break;
                case ";": return "1-6"; break;
                default: return error("Symbol \",\" or \";\" expected");
            }
        },
        "1-6": function (lex) {
            if (lex.lexeme === "start") {
                stack.push("1-7");
                return "2-1";
            } else {
                return error("Keyword \"begin\" expected");
            }
        },
        "1-7": function (lex) {
            if (lex.lexeme === "end") {
                return "1-8";
            } else {
                stack.push("1-7");
                return nullSymb("2-1");
            }
        },
        "1-8": function (lex) {
            return lex.lexeme === "}" ? exit() : error("Symbol \"}\" expected");
        }, // program end

        "2-1": function (lex) { // operator: <operator>;
            if (lex.lexeme === "input" || lex.lexeme === "output") {
                return "2-2";
            } else if (lex.code === CODE_ID) {
                return "2-4";
            } else if (lex.lexeme === "do") {
                return "2-6";
            } else if (lex.lexeme === "if") {
                //return "2-19";
                stack.push("2-20");
                return "4-2";
            } else {
                return error("Operator expected");
            }
        },
        "2-2": function (lex) {
            return lex.code === CODE_ID ? "2-3" : error("Identifier expected");
        },
        "2-3": function (lex) {
            if (lex.lexeme === ",") { // list of id's
                return "2-2";
            } else if (lex.lexeme === ";") {
                // return nullSymb("2-fin");
                return exit();
            } else {
                return error("Symbol \",\" or \";\" expected.");
            }
        },
        "2-4": function (lex) { // a = b
            return lex.lexeme === "=" ? "2-5" : error("Symbol \"=\" expected");
        },
        "2-5": function () {
            stack.push("2-fin");
            return nullSymb("3-1");
        },
        "2-6": function (lex) { // do
            return lex.code === CODE_ID ? "2-7" : error("Identifier expected");
        },
        "2-7": function (lex) {
            //return lex.lexeme === "=" ? "2-8" : error("Symbol \"=\" expected");
            if (lex.lexeme === "=") {
                stack.push("2-9");
                return "3-1";
            } else {
                return error("Symbol \"=\" expected");
            }
        },
//        "2-8": function () {
//            stack.push("2-9");
//            return nullSymb("3-1");
//        },
        "2-9": function (lex) {
            //return lex.lexeme === "to" ? "2-10" : error("Keyword \"to\" expected");
            if (lex.lexeme === "to") {
                stack.push("2-11");
                return "3-1";
            } else {
                return error("Keyword \"to\" expected");
            }
        },
//        "2-10": function () {
//            stack.push("2-11");
//            return nullSymb("3-1");
//        },
        "2-11": function (lex) {
            //return lex.lexeme === "by" ? "2-12" : error("Keyword \"by\" expected");
            if (lex.lexeme === "by") {
                stack.push("2-13");
                return "3-1";
            } else {
                return error("Keyword \"by\" expected");
            }
        },
//        "2-12": function () {
//            stack.push("2-13");
//            return nullSymb("3-1");
//        },
        "2-13": function (lex) {
            return lex.lexeme === "while" ? "2-14" : error("Keyword \"while\" expected");
        },
        "2-14": function (lex) {
            //return lex.lexeme === "(" ? "2-15" : error("Symbol \"(\" expected");
            if (lex.lexeme === "(") {
                stack.push("2-16");
                return "4-2";
            } else {
                return error("Symbol \"(\" expected");
            }
        },
//        "2-15": function () {
//            stack.push("2-16");
//            return nullSymb("4-1");
//        },
        "2-16": function (lex) {
            //return lex.lexeme === ")" ? "2-17" : error("Symbol \")\" expected");
            if (lex.lexeme === ")") {
                stack.push("2-18");
                return "2-1";
            } else {
                return error("Symbol \")\" expected");
            }
        },
//        "2-17": function () {
//            stack.push("2-18");
//            return nullSymb("2-1");
//        },
        "2-18": function (lex) {
            if (lex.lexeme === "end") {
                return "2-18.1";
            } else {
                stack.push("2-18");
                return nullSymb("2-1");
            }
        },
        "2-18.1": function (lex) {
            return lex.lexeme === ";" ? exit() : error("Symbol \";\" expected");
        },
//        "2-19": function () { // if
//            stack.push("2-20");
//            return nullSymb("4-2");
//        },
        "2-20": function (lex) {
            //return lex.lexeme === "then" ? "2-21" : error("Keyword \"then\" expected");
            if (lex.lexeme === "then") {
                return "2-1";
            } else {
                return error("Keyword \"then\" expected");
            }
        },
//        "2-21": function () {
//            return nullSymb("2-1");
//        },
        "2-fin": function (lex) {
            return lex.lexeme === ";" ? exit() : error("Symbol \";\" expected");
        },

        "3-1": function (lex) { // expression
            if (lex.code === CODE_ID || lex.code === CODE_CONST) {
                return "3-2";
            } else if (lex.lexeme === "(") {
                stack.push("3-1.1");
                return "3-1";
            } else {
                return error("Identifier or \"(\" expected");
            }
        },
        "3-1.1": function (lex) { // closing bracket )
            return lex.lexeme === ")" ? "3-2" : error("Symbol \")\" expected");
        },
        "3-2": function (lex) {
            return lex.lexeme.match(/[\-\+\*\/\^]/) ? "3-1" : exitNullS();
        },

//        "4-1": function () {
//            stack.push("4-1.1");
//            return nullSymb("4-2");
//        },
//        "4-1.1": function (lex) {
//            return lex.lexeme.match(/or|and/) ? "4-1" : exitNullS();
//        },
        "4-2": function (lex) {
            if (lex.lexeme === "not") {
                return "4-2";
            } else if (lex.lexeme === "[") {
                stack.push("4-4");
                return "4-2"; // test
            } else {
                stack.push("4-3.1");
                return nullSymb("3-1");
            }
        },
//        "4-3": function () { // > < != ...
//            stack.push("4-3.1");
//            return nullSymb("3-1");
//        },
        "4-3.1": function (lex) {
            if (lex.lexeme === "<" || lex.lexeme === ">" || lex.lexeme === ">=" || lex.lexeme === "<=" || lex.lexeme === "==" || lex.lexeme === "!=") {
                return "4-3.4";
//            } else if (lex.lexeme === "!") {
//                return "4-3.3";
            } else { // ^=
                return error("Logical symbol expected");
            }
        },
//        "4-3.2": function (lex) {
//            if (lex.lexeme === "=") {
//                return "4-3.4";
//            } else {
//                return nullSymb("4-3.4");
//            }
//        },
//        "4-3.3": function (lex) { // !=
//            return lex.lexeme === "=" ? "4-3.4" : error("Symbol \"=\" expected");
//        },
        "4-3.4": function () {
            stack.push("4-4.1");
            return nullSymb("3-1");
        },
//        "4-3.5": function () {
//            return exitNullS();
//        },
        "4-4": function (lex) { // KitKat
            return lex.lexeme === "]" ? "4-4.1" : error("Symbol \"]\" expected");
        },
        "4-4.1": function (lex) {
            if (lex.lexeme === "or" || lex.lexeme === "and") {
                return "4-2";
            } else {
                return exitNullS();
            }
        }

    };

};

/**
 * @param {{ lexemes: Object, IDs: Object, CONSTs: Object }} translation
 */
SyntaxAnalyzer2.prototype.check = function (translation) {

    var _ = this,
        lexemesArray = translation.lexemes,
        i, result, temp,
        state = "1-1",
        htmlLogCount = 0,
        htmlLog = ["<h1>PushDown automaton table</h1><hr/><table><thead><tr><th>#</th>" +
            "<th>State</th><th>Lexeme</th><th>Position</th>" +
            "<th>Current stack</th></tr></thead><tbody>"],

        returnError = function (text) {
            htmlLog.push("</tbody></table>");
            return {
                error: text,
                html: htmlLog.join("")
            };
        },

        printableStack = function () {
            return _.stack.length ? "[ " + _.stack.join(" ] » [ ") + " ]" : "{null}";
        };

    for (i = 0; i < lexemesArray.length; i++) {

        if (typeof this.automaton[state] !== "function") {
            return returnError("Algorithm error: state " + state + " was not defined.");
        }

        htmlLog.push("<tr><td>" + (++htmlLogCount) + "</td><td style=\"font-weight: 900; "
            + "font-style: italic;\">" + state + "</td><td>"
            + lexemesArray[i].lexeme + "</td><td>(" + lexemesArray[i].position.row + ", "
            + lexemesArray[i].position.column + ")</td><td style=\"text-align: left;\">"
            + printableStack() + "</td></tr>");
        result = this.automaton[state].call(this, lexemesArray[i]);

        if (result === undefined) {
            return returnError("Algorithm error: state " + state + " does not returns result.\n" +
                "STACK: " + printableStack());
        } else if (result.error) {
            return returnError("ERROR ON \"" + lexemesArray[i].lexeme + "\" ("
                + lexemesArray[i].position.row + ", " + lexemesArray[i].position.column
                + "): " + result.error + ";\nON STATE: " + state
                + "\nSTACK: "+ printableStack());
        } else if (result.continue) { // save cursor on current symbol and change state
            state = result.continue;
            i--;
        } else if (result.exit) {
            temp = this.stack.pop();
            if (!temp) break; // program end reached
            if (result.exit === "nullSymbol") i--;
            state = temp;
        } else if (typeof result === "string") {
            state = result;
        }

        // do not place here code because of if-else continue

    }

    if (this.stack.length > 0) {
        return returnError("Program end with non empty stack: " + printableStack());
    }

    if (state !== "1-8") {
        return returnError("Program is not complete. Is keyword \"end\" missed?");
    }

    if (i + 1 < lexemesArray.length) {
        return returnError("Program end reached, but \"" + lexemesArray[i + 1].lexeme
            + "\" found.");
    }

    return returnError(null);

};

module.exports = SyntaxAnalyzer2;
