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
            ["<idList>", "$ID"]
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
            ["<expression>", "-", "<terminal1>"]
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

    return {
        error: "Not implemented",
        html: "Not implemented"
    };

};

module.exports = SyntaxAnalyzer3;