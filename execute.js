/**
 * This module allows to execute *.zre files.
 */

var fs = require("fs"),
    readLineSync = require("readline-sync"),
    args = process.argv.slice(2),
    file = args[0],
    content, rpn, IDs, CONSTs, i, cursor, label, n,
    stack = [],
    labels; // labels found before

if (file.match(/.*\.zre$/) === null) file += ".zre";
if (!fs.existsSync(file)) { console.error("File '%s' not found.", file); }

try {
    content = JSON.parse(fs.readFileSync((file[0] === "/" ? file : __dirname + "/" + file)));
} catch (e) { console.error("Executable file parse error: %s", e.message); }

rpn = content.rpn;
labels = content.labels;
IDs = content.id;
CONSTs = content.const;

// for cycle special variables
IDs["_r1"] = 0;
IDs["_r2"] = 0;
IDs["_r3"] = 0;

var val = function (value) {
    if (typeof value === "number" || typeof value === "boolean") return value;
    else if (IDs.hasOwnProperty(value)) return IDs[value];
    else console.error("Value " + value + " was not registered.");
};

for (cursor = 0; cursor < rpn.length; cursor++) {
    //console.log(
    //    rpn.map(function (val, i) { return (i === cursor) ? "\x1B[0;31m" + val + "\x1B[0m" : val; }).join(" "),
    //    "\x1b[1;34m{" + stack.join(" ") + "}\x1b[0m "
    //);
    if (rpn[cursor][0] === "$") {
        if (rpn[cursor][1] === "?") { // ?JBF - Jump by false
            var pos = labels[stack.pop()], condition = stack.pop();
            if (!condition) cursor = pos - 1;
        } else if (rpn[cursor][1] === "J") {
            cursor = labels[stack.pop()] - 1;
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
            return idName + "=" + IDs[idName];
        }).join(", "));
        stack.splice(n);
    } else if (rpn[cursor] === "input") {
        stack.slice(n = -stack.pop()).map(function (idName) {
            IDs[idName] = parseFloat(readLineSync.question("> ")) || 0;
        });
        stack.splice(n);
    }
}
