/**
 * This module allows to execute *.zre files.
 */

var fs = require("fs"),
    args = process.argv.slice(2),
    file = args[0],
    content, rpn, IDs, CONSTs, i, cursor, label, n,
    stack = [],
    labels; // labels found before

require("prompt-sync");

if (file.match(/.*\.zre$/) === null) file += ".zre";
if (!fs.existsSync(file)) { console.error("File '%s' not found.", file); }

try {
    content = JSON.parse(fs.readFileSync((file[0] === "/" ? file : __dirname + "/" + file)));
} catch (e) { console.error("Executable file parse error: %s", e.message); }

rpn = content.rpn;
labels = content.labels;
IDs = content.id;
CONSTs = content.const;

var val = function (value) {
    if (typeof value === "number" || typeof value === "boolean") return value;
    else if (IDs.hasOwnProperty(value)) return IDs[value];
    else console.error("Value " + value + " was not registered.");
};

//var seek = function (l, i) {
//    var d = labels.hasOwnProperty(l) ? -1 : 1,
//        label = "$:" + l;
//    while (typeof rpn[i] !== "undefined" && rpn[i] !== label) i += d;
//    if (rpn[i]) {
//        return i;
//    } else {
//        console.error("Fatal error: undefined label " + label);
//        process.exit(1000);
//        return 0;
//    }
//};
//var setLabel = function (l, i) { labels[l] = i; };

for (cursor = 0; cursor < rpn.length; cursor++) {
    //console.log(
    //    "{" + stack.join(" ") + "} | "
    //    + rpn.map(function (val, i) { return (i === cursor) ? "\x1B[0;31m[" + val + "]\x1B[0m" : val; }).join(" ")
    //);
    if (rpn[cursor][0] === "$") {
        if (rpn[cursor][1] === "?") { // ?JBF - Jump by false
            var pos = labels[stack.pop()], condition = stack.pop();
            if (!condition) cursor = pos - 1;
        }
    } else if (typeof rpn[cursor] === "number") stack.push(rpn[cursor]);
    else if (IDs.hasOwnProperty(rpn[cursor])) stack.push(rpn[cursor]);
    else if (rpn[cursor] === "+") stack.push(val(stack.pop()) + val(stack.pop()));
    else if (rpn[cursor] === "-") {
        stack[stack.length - 2] = val(stack[stack.length - 2]) - val(stack[stack.length - 1]);
        stack.pop();
    } else if (rpn[cursor] === "*") stack.push(val(stack.pop()) * val(stack.pop()));
    else if (rpn[cursor] === "/") {
        stack[stack.length - 2] = val(stack[stack.length - 2]) / val(stack[stack.length - 1]);
        stack.pop();
    } else if (rpn[cursor] === "^") {
        stack[stack.length - 2] =
            Math.pow(val(stack[stack.length - 2]), val(stack[stack.length - 1]));
        stack.pop();
    } else if (rpn[cursor] === ">") {
        stack[stack.length - 2] = val(stack[stack.length - 2]) > val(stack[stack.length - 1]);
        stack.pop();
    } else if (rpn[cursor] === ">=") {
        stack[stack.length - 2] = val(stack[stack.length - 2]) >= val(stack[stack.length - 1]);
        stack.pop();
    } else if (rpn[cursor] === "<") {
        stack[stack.length - 2] = val(stack[stack.length - 2]) < val(stack[stack.length - 1]);
        stack.pop();
    } else if (rpn[cursor] === "<=") {
        stack[stack.length - 2] = val(stack[stack.length - 2]) <= val(stack[stack.length - 1]);
        stack.pop();
    } else if (rpn[cursor] === "==") {
        stack[stack.length - 2] = val(stack[stack.length - 2]) == val(stack[stack.length - 1]);
        stack.pop();
    } else if (rpn[cursor] === "!=") {
        stack[stack.length - 2] = val(stack[stack.length - 2]) != val(stack[stack.length - 1]);
        stack.pop();
    } else if (rpn[cursor] === "and") stack.push(val(stack.pop()) && val(stack.pop()));
    else if (rpn[cursor] === "or") stack.push(val(stack.pop()) || val(stack.pop()));
    else if (rpn[cursor] === "not") stack.push(!val(stack.pop()));
    else if (rpn[cursor] === "=") {
        IDs[stack[stack.length - 2]] = val(stack[stack.length - 1]);
        stack.splice(stack.length - 2, 2);
    } else if (rpn[cursor] === "output") {
        console.log(stack.slice(n = -stack.pop()).map(function (idName) {
            return IDs[idName];
        }).join(", "));
        stack.splice(n);
    } else if (rpn[cursor] === "input") {
        console.log(stack.slice(n = -stack.pop()).map(function (idName) {
            IDs[idName] = parseFloat(prompt()) || 0;
        }).join(", "));
        stack.splice(n);
    }
}

//for (i = 0; i < rpn.length; i++) {
//    if (rpn[i][0] === "$") {
//        if (rpn[i][1] === ":") { // label definition
//            label = rpn[i].toString().substring(2);
//            setLabel(label, i);
//        } else if (rpn[i][1] === "?") { // seek by false
//            label = rpn[i - 1].toString().substring(2);
//            if (rpn[i - 2] === false) {
//                i = seek(label, i);
//            }
//        }
//    }
//    else if (rpn[i] === "+") { rpn.splice(i - 2, 3, val(i - 2) + val(i - 1)); i -= 2; }
//    else if (rpn[i] === "-") { rpn.splice(i - 2, 3, val(i - 2) - val(i - 1)); i -= 2; }
//    else if (rpn[i] === "*") { rpn.splice(i - 2, 3, val(i - 2) * val(i - 1)); i -= 2; }
//    else if (rpn[i] === "/") { rpn.splice(i - 2, 3, val(i - 2) / val(i - 1)); i -= 2; }
//    else if (rpn[i] === "^") { rpn.splice(i - 2, 3, Math.pow(val(i - 2), val(i - 1))); i -= 2; }
//    else if (rpn[i] === ">") { rpn.splice(i - 2, 3, val(i - 2) > val(i - 1)); i -= 2; }
//    else if (rpn[i] === ">=") { rpn.splice(i - 2, 3, val(i - 2) >= val(i - 1)); i -= 2; }
//    else if (rpn[i] === "<") { rpn.splice(i - 2, 3, val(i - 2) < val(i - 1)); i -= 2; }
//    else if (rpn[i] === "<=") { rpn.splice(i - 2, 3, val(i - 2) <= val(i - 1)); i -= 2; }
//    else if (rpn[i] === "==") { rpn.splice(i - 2, 3, val(i - 2) == val(i - 1)); i -= 2; }
//    else if (rpn[i] === "!=") { rpn.splice(i - 2, 3, val(i - 2) != val(i - 1)); i -= 2; }
//    else if (rpn[i] === "and") { rpn.splice(i - 2, 3, val(i - 2) && val(i - 1)); i -= 2; }
//    else if (rpn[i] === "or") { rpn.splice(i - 2, 3, val(i - 2) || val(i - 1)); i -= 2; }
//    else if (rpn[i] === "not") { rpn.splice(i - 1, 2, !val(i - 1)); i -= 1; }
//    else if (rpn[i] === "=") {
//        IDs[rpn[i - 2]] = rpn[i - 1];
//        rpn.splice(i - 2, 3);
//        i -= 2;
//    }
//    else if (rpn[i] === "output") {
//        console.log(rpn.slice(i - 1 - rpn[i - 1], i - 1).map(function (idName) {
//            return IDs[idName];
//        }).join(", "));
//        tempI = 2 + rpn[i - 1];
//        rpn.splice(i - 1 - rpn[i - 1], 2 + rpn[i - 1]);
//        i -= tempI;
//    }
//}