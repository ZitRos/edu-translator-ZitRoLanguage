var extend = require('util')._extend;

var SyntaxAnalyzer = function () {

    var CODE_ID = 34,
        CODE_CONST = 35;

    this.rules = {

        "idle": function (chain) {},

        "program": function (chain) {
            chain
                .match("module")
                .match({ code: CODE_ID })
                .match("{")
                .match("var")
                .rule("identifierList")
                .match(";")
                .match("start")
                .rule("operatorList")
                .match(";")
                .match("end")
                .match("}");
        },

        "identifierSubList": function (chain) {
            chain
                .match(",")
                .match({ code: CODE_ID });
        },
        "identifierList": function (chain) {
            chain
                .match({ code: CODE_ID })
                .repeatRule("identifierSubList", 0);
        },

        "operatorSubList": function (chain) {
            chain
                .match(";")
                .rule("operator");
        },
        "operatorList": function (chain) {
            chain
                .rule("operator")
                .repeatRule("operatorSubList", 0);
        },

        "operator": function (chain) {
            chain
                .rules("inputOperator", "outputOperator", "assignOperator", "cycleOperator",
                    "conditionOperator");
        },

        "inputOperator": function (chain) {
            chain
                .match("input")
                .rule("identifierList");
        },
        "outputOperator": function (chain) {
            chain
                .match("output")
                .rule("identifierList");
        },
        "assignOperator": function (chain) {
            chain
                .match({ code: CODE_ID })
                .match("=")
                .rule("expression");
        },
        "cycleOperator": function (chain) {
            chain
                .match("do")
                .match({ code: CODE_ID })
                .match("=")
                .rule("expression")
                .match("to")
                .rule("expression")
                .match("by")
                .rule("expression")
                .match("while")
                .match("(")
                .rule("logicalExpression")
                .match(")")
                .rule("operatorList")
                .match(";")
                .match("end")
        },
        "conditionOperator": function (chain) {
            chain
                .match("if")
                .rule("logicalExpression")
                .match("then")
                .rule("operator")
        },

        "subExpr+": function (chain) {
            chain
                .match("+")
                .rule("termExpr");
        },
        "subExpr-": function (chain) {
            chain
                .match("-")
                .rule("termExpr");
        },
        "subExpr": function (chain) {
            chain
                .rules("subExpr+", "subExpr-");
        },
        "expression": function (chain) {
            chain
                .rule("termExpr")
                .repeatRule("subExpr", 0);
        },

        "termExpr/": function (chain) {
            chain
                .match("/")
                .rule("termExpr");
        },
        "termExpr*": function (chain) {
            chain
                .match("*")
                .rule("termExpr");
        },
        "termSubExpr": function (chain) {
            chain
                .rules("termExpr*", "termExpr/");
        },
        "termExpr": function (chain) {
            chain
                .rule("mulExpr")
                .repeatRule("termSubExpr", 0);
        },

        "mulSubExpr": function (chain) {
            chain
                .match("^")
                .rule("basicExpr");
        },
        "mulExpr": function (chain) {
            chain
                .rule("basicExpr")
                .repeatRule("mulSubExpr", 0);
        },

        "BE_ID": function (chain) {
            chain
                .match({ code: CODE_ID });
        },
        "BE_CONST": function (chain) {
            chain
                .match({ code: CODE_CONST });
        },
        "BE_BR": function (chain) {
            chain
                .match("(")
                .rule("expression")
                .match(")");
        },
        "basicExpr": function (chain) {
            chain
                .rules("BE_ID", "BE_CONST", "BE_BR");
        },

        "logSubExpr": function (chain) {
            chain
                .match("or")
                .rule("logTerm");
        },
        "logicalExpression": function (chain) {
            chain
                .rule("logTerm")
                .repeatRule("logSubExpr", 0);
        },

        "logSubMul": function (chain) {
            chain
                .match("and")
                .rule("logMul");
        },
        "logTerm": function (chain) {
            chain
                .rule("logMul")
                .repeatRule("logSubMul", 0);
        },

        "logMulNot": function (chain) {
            chain
                .match("not");
        },
        "logMulExpr": function (chain) {
            chain
                .match("[")
                .rule("logicalExpression")
                .match("]");
        },
        "logMul": function (chain) {
            chain
                .repeatRule("logMulNot", 0)
                .rules("logMulExpr", "ratio");
        },

//        "RS1-1-1": function (chain) {
//            chain
//                .match("<");
//        },
//        "RS1-1-2": function (chain) {
//            chain
//                .match(">");
//        },
//        "RS1-1": function (chain) {
//            chain
//                .rules("RS1-1-1", "RS1-1-2");
//        },
//        "RS1-2-1": function (chain) {
//            chain
//                .match("=");
//        },
//        "RS1-2": function (chain) {
//            chain
//                .rules("RS1-2-1", "idle");
//        },
//        "RS1": function (chain) {
//            chain
//                .rule("RS1-1")
//                .rule("RS1-2");
//        },
//        "RS2-1": function (chain) {
//            chain
//                .match("!");
//        },
//        "RS2-2": function (chain) {
//            chain
//                .rule("idle");
//        },
//        "RS2": function (chain) {
//            chain
//                .rules("RS2-1", "RS2-2")
//                .match("=");
//        },
        "RS1": function (chain) {
            chain
                .match(">=");
        },
        "RS2": function (chain) {
            chain
                .match("<=");
        },
        "RS3": function (chain) {
            chain
                .match("!=");
        },
        "RS4": function (chain) {
            chain
                .match("==");
        },
        "RS5": function (chain) {
            chain
                .match(">");
        },
        "RS6": function (chain) {
            chain
                .match("<");
        },
        "ratioSub": function (chain) {
            chain
                .rules(/*"RS1", "RS2"*/"RS1", "RS2", "RS3", "RS4", "RS5", "RS6");
        },
        "ratio": function (chain) {
            chain
                .rule("expression")
                .rule("ratioSub")
                .rule("expression");
        }

    };

};

SyntaxAnalyzer.prototype.translationPrototype = function (translation) {

    var obj = extend({ "errors": [] }, translation),
        hasErrors = function () { return obj["errors"].length > 0;},
        error = function (string, priority, pos) {
            obj.errorStack.push({message: string, priority: priority || Infinity,
                position: pos || { row: -1, column: -1 } });
            obj["errors"].unshift(string); return obj["errors"][0];
        },
        parsePos = function (posObj) { return "(" + posObj.row + ", " + posObj.column + ")" },
        rules = this.rules,
        level = 0,
        _this = this;

    obj.errorStack = [];

    obj.log = function (text) {

        console.log(text);

        return obj;

    };

    obj.match = function (condition) {

        var lexeme;

        if (hasErrors()) return obj;

        lexeme = obj.lexemes.splice(0, 1)[0] || null;

        if (lexeme === null) {

            error("Syntax error at program end: \"" + condition
                    + "\" expected.",
                    Infinity, { row: -1, column: -1 });

        } else if (typeof condition === "string") { // terminal

            if (condition !== lexeme.lexeme) {
                error("Syntax error in "
                        + parsePos(lexeme.position) + ": \"" + condition
                        + "\" expected, but \"" + lexeme.lexeme + "\" found.",
                        lexeme.position.row * 32000 + lexeme.position.column,
                    lexeme.position);
            }

        } else if (typeof condition === "object") {

            if (typeof condition.code !== "undefined") {
                if (lexeme.code !== condition.code) {
                    error("Syntax error in "
                        + parsePos(lexeme.position) + ": IDENTIFIER expected, but \""
                        + lexeme.lexeme + "\" found.",
                            lexeme.position.row * 32000 + lexeme.position.column,
                            lexeme.position);
                }
            }

        }

        return obj;

    };

    obj.rule = function (ruleName) {

        if (hasErrors()) return obj;

        if (typeof rules[ruleName] === "function") {
            level++;
            rules[ruleName].call(_this, obj);
            level--;
        } else {
            console.error(error("Compiler error: unknown rule \""
                + ruleName + "\" in condition."));
        }

        return obj;

    };

    obj.repeatRule = function (ruleName, minTimes, maxTimes) {

        var lexemesBackup,
            rule = rules[ruleName],
            i;

        if (hasErrors()) return obj;

        if (typeof minTimes === "undefined") minTimes = 1;
        if (typeof maxTimes === "undefined") maxTimes = Infinity;

        if (typeof rule !== "function") {
            console.error(error("Compiler error: unknown rule \""
                + ruleName + "\" in condition."));
        } else {
            for (i = 0; i < minTimes; i++) {
                level++;
                rule.call(_this, obj);
                level--;
            }
            if (hasErrors()) return obj;
            for (i = minTimes; i <= maxTimes; i++) {
                lexemesBackup = JSON.stringify(obj.lexemes);
                level++;
                rule.call(_this, obj);
                level--;
                if (hasErrors()) {
                    obj.lexemes = JSON.parse(lexemesBackup);
                    obj.errors = [];
                    break;
                }
            }
        }

        return obj;

    };

    obj.rules = function () {

        var i, ruleName, lexemesBackup;

        if (hasErrors()) return obj;

        for (i = 0; i < arguments.length; i++) {
            ruleName = arguments[i];
            if (typeof rules[ruleName] !== "function") {
                console.error(error("Compiler error: unknown rule \""
                    + ruleName + "\" in condition."));
            } else {
                lexemesBackup = JSON.stringify(obj.lexemes);
                level++;
                rules[ruleName].call(_this, obj);
                level--;
                if (hasErrors() && i < arguments.length - 1) {
                    obj.lexemes = JSON.parse(lexemesBackup);
                    obj.errors = [];
                } else {
                    break;
                }
            }
        }

        return obj;

    };

    return obj;

};

/**
 * @param {{ lexemes: Object, IDs: Object, CONSTs: Object }} translation
 */
SyntaxAnalyzer.prototype.check = function (translation) {

    var mainError = null;

    translation = this.translationPrototype(JSON.parse(JSON.stringify(translation)));
    this.rules["program"](translation);

    if (translation.errors.length === 0) {

        translation["errorStack"] = [];

    } else { // find the most deep error in stack

        var mx = 0,
            arr = translation["errorStack"],
            max = arr[0].priority;

        for (var i = 1; i < arr.length; i++) {
            if (arr[i].priority > max) {
                max = arr[i].priority;
                mx = i;
            }
        }

        mainError = translation["errorStack"][mx].message || translation.errors[0];

    }

    if (!mainError && translation.lexemes.length > 0) {

        mainError = "Unnecessary lexeme \"" + translation.lexemes[0].lexeme + "\" at ("
            + translation.lexemes[0].position.row + ", " + translation.lexemes[0].position.column
            + ")."

    }

    return {
        error: mainError
    }

};

module.exports = SyntaxAnalyzer;
