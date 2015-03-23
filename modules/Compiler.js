var fs = require("fs");

var PRIORITIES = [
        ["(", "[", "if", "for", "end"],
        [")", "]", "then", "to", "by", "while", "do"],
        ["="],
        ["or"],
        ["and"],
        ["not"],
        ["<", "<=", "==", ">", ">=", "!="],
        ["+", "-"],
        ["*", "/"],
        ["^"]
    ],
    // IF
    // if ()       then    {rpn}   ;
    //    ЛВ      m1 УПХ           m1:
    //
    // doNotFreeStack:false - do not free stack
    // miss:false - do not add symbol to stack. Miss does not block onStack trigger.
    // freeStackUntil:false - free stack until symbol reached (including symbol itself, without
    //                                                         writing to RPN)
    // ignore:false - ignore the symbol
    REGISTERED = {
        "label": {},
        "identifier": {
            onRPN: function (stack, rpn) {
                if (FLAG_1) {
                    FLAG_1 = false;
                    NESTING_STACK.push(rpn[rpn.length - 1]);
                }
            }
        },
        "=": {},
        "+": {},
        "-": {},
        "*": {},
        "/": {},
        "^": {},
        "and": {},
        "or": {},
        "not": {},
        ">": {},
        ">=": {},
        "<": {},
        "<=": {},
        "==": {},
        "!=": {},
        "if": {
            miss: true,
            onStack: function () {
                if ((NESTING_STACK[NESTING_STACK.length - 1] || {}).textValue !== "if")
                    NESTING_STACK.push({ textValue: "if" });
            }
        },
        "then": {
            onStack: function (stack, rpn) {

                var labelIndex = LABEL_COUNTER++;

                stack.splice(stack.length - 1, 1, {
                    value: "label",
                    labelIndex: labelIndex,
                    textValue: "$:" + labelIndex
                });
                rpn.push({
                    textValue: labelIndex
                }, {
                    textValue: "$?" // jump by false
                });

            }
        },
        ";": {
            miss: true,
            onStack: function (stack, rpn) {
                if ((NESTING_STACK[NESTING_STACK.length - 1] || {}).textValue === "if") {
                    while (stack.length && stack[stack.length - 1].textValue.substr(0, 2) === "$:") { // if-label
                        rpn.push(stack.pop());
                    }
                    NESTING_STACK.pop();
                }
            }
        },
        "(": { doNotFreeStack: true },
        ")": { miss: true, freeStackUntil: "(" },
        "[": { doNotFreeStack: true },
        "]": { miss: true, freeStackUntil: "[" },
        ":": { ignore: true },
        ",": { ignore: true },
        "output": {
            onStack: function (stack, rpn) {
                IO_ARGUMENT_COUNTER = rpn.length;
            },
            onRPN: function (stack, rpn) {
                rpn.splice(rpn.length - 1, 0, {
                    value: rpn.length - IO_ARGUMENT_COUNTER - 1,
                    textValue: rpn.length - IO_ARGUMENT_COUNTER - 1
                });
            }
        },
        "input": {
            onStack: function (stack, rpn) {
                IO_ARGUMENT_COUNTER = rpn.length;
            },
            onRPN: function (stack, rpn) {
                rpn.splice(rpn.length - 1, 0, {
                    value: rpn.length - IO_ARGUMENT_COUNTER - 1,
                    textValue: rpn.length - IO_ARGUMENT_COUNTER - 1
                });
            }
        },
        "for": {
            miss: true,
            onStack: function () {
                FLAG_1 = true;
            }
        },
        "to": {
            miss: true,
            onStack: function (stack, rpn) {
                var labelIndex = LABEL_COUNTER++;
                NESTING_STACK.push({ textValue: labelIndex });
                rpn.push(
                    { textValue: "_r1" },
                    { textValue: 1 },
                    { textValue: "=" },
                    { value: "label", labelIndex: labelIndex, textValue: "$:" + labelIndex },
                    { textValue: "_r2" }
                );
            }
        },
        "by": {
            miss: true,
            onStack: function (stack, rpn) {
                rpn.push(
                    { textValue: "=" },
                    { textValue: "_r3" }
                );
            }
        },
        "while": {
            miss: true,
            onStack: function (stack, rpn) {
                var labelIndex = LABEL_COUNTER++;
                NESTING_STACK.push({ textValue: labelIndex });
                rpn.push(
                    { textValue: "=" },
                    { textValue: "_r1" },
                    { textValue: 0 },
                    { textValue: "==" },
                    { textValue: labelIndex },
                    { textValue: "$?" },
                    { textValue: NESTING_STACK[NESTING_STACK.length - 3].textValue }, // id
                    { textValue: NESTING_STACK[NESTING_STACK.length - 3].textValue },
                    { textValue: "_r3" },
                    { textValue: "+" },
                    { textValue: "=" },
                    { value: "label", labelIndex: labelIndex, textValue: "$:" + labelIndex }
                );
            }
        },
        "do": {
            miss: true,
            onStack: function (stack, rpn) {
                var labelIndex = LABEL_COUNTER++;
                NESTING_STACK.push({ textValue: labelIndex });
                rpn.push(
                    { textValue: labelIndex },
                    { textValue: "$?" },
                    { textValue: "_r1" },
                    { textValue: 0 },
                    { textValue: "=" },
                    { textValue: NESTING_STACK[NESTING_STACK.length - 4].textValue }, // id
                    { textValue: "_r2" },
                    { textValue: "-" },
                    { textValue: "_r3" },
                    { textValue: "*" },
                    { textValue: 0 },
                    { textValue: "<=" },
                    { textValue: labelIndex },
                    { textValue: "$?" }
                );
            }
        },
        "end": {
            miss: true,
            onStack: function (stack, rpn) {

                REGISTERED[";"].onStack(stack, rpn);

                var labelIndex = NESTING_STACK[NESTING_STACK.length - 1].textValue;
                rpn.push(
                    { textValue: NESTING_STACK[NESTING_STACK.length - 3].textValue }, // m1
                    { textValue: "$J" },
                    { value: "label", labelIndex: labelIndex, textValue: "$:" + labelIndex } // m3
                );
                NESTING_STACK.splice(NESTING_STACK.length - 4, 4);

            }
        }
    },
    START_LEXEME = "start",
    ID_LEXEME_CODE = 34,
    CONST_LEXEME_CODE = 35,

    TYPE_ID = 0,
    TYPE_CONST = 1;

var IO_ARGUMENT_COUNTER = 0,
    LABEL_COUNTER = 0,
    NESTING_STACK = [],
    FLAG_1 = false; // for cycle remember variable

/**
 * Compiles program to
 * @constructor
 */
var Compiler = function () {

    /**
     * { lexeme (string): priority (number) }
     * @type {object}
     */
    this.priorities = null;

    this.init();

};

Compiler.prototype.init = function () {

    this.priorities = {};
    for (var i in PRIORITIES) { // set priorities
        for (var j in PRIORITIES[i]) {
            this.priorities[PRIORITIES[i][j]] = parseInt(i);
        }
    }

};

/**
 * Compile the code and return program code that can be interpreted later.
 *
 * @returns {object[]}
 */
Compiler.prototype.getRPN = function (translation) {

    var lexemeArray = translation.lexemes.slice(0, translation.lexemes.length - 2), // slice to end
        stack = [], rpn = [],
        topStack, i, code, lexeme, priority, registered;

    // find start of a program and slice to it
    for (i in lexemeArray) { if (lexemeArray[i].lexeme === START_LEXEME) break; }
    lexemeArray = lexemeArray.slice(parseInt(i) + 1);

    // parse the program
    for (i in lexemeArray) {

        lexeme = lexemeArray[i].lexeme;
        code = lexemeArray[i].code;
        priority = this.priorities[lexeme] || -1;
        registered = REGISTERED[lexeme] || {};

        // CONST and ID -> out
        if (code === ID_LEXEME_CODE || code === CONST_LEXEME_CODE) {
            rpn.push({
                type: code === ID_LEXEME_CODE ? TYPE_ID : TYPE_CONST,
                value: lexemeArray[i].classCode,
                textValue: code === ID_LEXEME_CODE ? lexeme : parseFloat(lexeme)
            });
            if (code === ID_LEXEME_CODE && REGISTERED["identifier"].onRPN) {
                REGISTERED["identifier"].onRPN(stack, rpn);
            }
            continue;
        }

        if (registered.ignore) continue;

        if (!registered.doNotFreeStack) {
            if (registered.freeStackUntil) {
                topStack = stack[stack.length - 1] || { priority: -2 };
                while (stack.length && stack[stack.length - 1].value !== registered.freeStackUntil) {
                    rpn.push(stack.pop());
                    if (typeof (REGISTERED[topStack.value] || {}).onRPN === "function") REGISTERED[topStack.value].onRPN(stack, rpn);
                    topStack = stack[stack.length - 1] || { priority: -1 };
                }
                // just pop symbol itself and check for malformed algorithm
                if (stack.length) { stack.pop(); }
                else { console.log("! Possible miss in algorithm."); }
            } else {
                topStack = stack[stack.length - 1] || { priority: -2 };
                while (stack.length && topStack.priority >= priority) {
                    rpn.push(stack.pop());
                    if (typeof (REGISTERED[topStack.value] || {}).onRPN === "function") REGISTERED[topStack.value].onRPN(stack, rpn);
                    topStack = stack[stack.length - 1] || { priority: -1 };
                }
            }
        }
        if (!registered.miss) {
            stack.push({
                value: lexeme,
                priority: priority,
                textValue: lexeme
            });
        }
        if (typeof registered.onStack === "function") registered.onStack(stack, rpn);

        console.log("Step %d: \x1b[0;31m[%s]\x1b[0m [%s] \x1b[0;34m[%s]\x1b[0m", i, stack.map(function (a) { return a.textValue; }).join(" "), rpn.map(function (a) { return a.textValue; }).join(), lexemeArray.slice(i).map(function (e) { return e.lexeme; }).join(" "))

    }

    while (stack.length) {
        rpn.push(topStack = stack.pop());
        registered = REGISTERED[topStack.value] || {};
        if (typeof registered.onRPN === "function") registered.onRPN(stack, rpn);
    }

    console.log("Step %d: \x1b[0;31m[%s]\x1b[0m [%s] \x1b[0;34m[%s]\x1b[0m", i, stack.map(function (a) { return a.textValue; }).join(" "), rpn.map(function (a) { return a.textValue; }).join(), lexemeArray.slice(i).map(function (e) { return e.lexeme; }).join(" "));

    return rpn;

};

Compiler.prototype.compile = function (FILENAME, translation) {

    var rpn = this.getRPN(translation),
        ids = translation.IDs,
        program, p, i,
        IDs = {},
        labels = {};

    for (p in ids) {
        IDs[ids[p].name] = 0;
    }

    // free labels
    for (i = 0; i < rpn.length; i++) {
        if (rpn[i].textValue.toString().substr(0, 2) === "$:") {
            labels[rpn[i].textValue.toString().slice(2)] = i;
            rpn.splice(i, 1);
            i--;
        }
    }

    program = {
        id: IDs,
        const: translation.CONSTs,
        labels: labels,
        rpn: rpn.map(function (a) {
            return typeof a.textValue === "undefined" ? "?" : a.textValue;
        })
        //rpnExt: rpn
    };

    fs.writeFileSync(FILENAME, JSON.stringify(program));

};

module.exports = Compiler;
