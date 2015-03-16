/**
 * This module allows to execute *.zre files.
 */
var fs = require("fs"),
    args = process.argv.slice(2),
    file = args[0],
    content, rpn, IDs, CONSTs, i, tempI, label,
    labels = {}; // labels found before

if (file.match(/.*\.zre$/) === null) file += ".zre";
if (!fs.existsSync(file)) { console.error("File '%s' not found.", file); }

try {
    content = JSON.parse(fs.readFileSync((file[0] === "/" ? file : __dirname + "/" + file)));
} catch (e) { console.error("Executable file parse error: %s", e.message); }

rpn = content.rpn;
IDs = content.id;
CONSTs = content.const;

var val = function (i) {
    if (typeof rpn[i] === "number" || typeof rpn[i] === "boolean") return rpn[i];
    else return IDs[rpn[i]];
};
var seek = function (l, i) {
    var d = labels.hasOwnProperty(l) ? -1 : 1,
        label = "$:" + l;
    while (typeof rpn[i] !== "undefined" && rpn[i] !== label) i += d;
    if (rpn[i]) {
        return i;
    } else {
        console.error("Fatal error: undefined label " + label);
        process.exit(1000);
        return 0;
    }
};
var setLabel = function (l, i) { labels[l] = i; };

for (i = 0; i < rpn.length; i++) {
    if (rpn[i][0] === "$") {
        if (rpn[i][1] === ":") { // label definition
            label = rpn[i].toString().substring(2);
            setLabel(label, i);
        } else if (rpn[i][1] === "?") { // seek by false
            label = rpn[i - 1].toString().substring(2);
            if (rpn[i - 2] === false) {
                i = seek(label, i);
            }
        }
    }
    else if (rpn[i] === "+") { rpn.splice(i - 2, 3, val(i - 2) + val(i - 1)); i -= 2; }
    else if (rpn[i] === "-") { rpn.splice(i - 2, 3, val(i - 2) - val(i - 1)); i -= 2; }
    else if (rpn[i] === "*") { rpn.splice(i - 2, 3, val(i - 2) * val(i - 1)); i -= 2; }
    else if (rpn[i] === "/") { rpn.splice(i - 2, 3, val(i - 2) / val(i - 1)); i -= 2; }
    else if (rpn[i] === "^") { rpn.splice(i - 2, 3, Math.pow(val(i - 2), val(i - 1))); i -= 2; }
    else if (rpn[i] === ">") { rpn.splice(i - 2, 3, val(i - 2) > val(i - 1)); i -= 2; }
    else if (rpn[i] === ">=") { rpn.splice(i - 2, 3, val(i - 2) >= val(i - 1)); i -= 2; }
    else if (rpn[i] === "<") { rpn.splice(i - 2, 3, val(i - 2) < val(i - 1)); i -= 2; }
    else if (rpn[i] === "<=") { rpn.splice(i - 2, 3, val(i - 2) <= val(i - 1)); i -= 2; }
    else if (rpn[i] === "==") { rpn.splice(i - 2, 3, val(i - 2) == val(i - 1)); i -= 2; }
    else if (rpn[i] === "!=") { rpn.splice(i - 2, 3, val(i - 2) != val(i - 1)); i -= 2; }
    else if (rpn[i] === "and") { rpn.splice(i - 2, 3, val(i - 2) && val(i - 1)); i -= 2; }
    else if (rpn[i] === "or") { rpn.splice(i - 2, 3, val(i - 2) || val(i - 1)); i -= 2; }
    else if (rpn[i] === "not") { rpn.splice(i - 1, 2, !val(i - 1)); i -= 1; }
    else if (rpn[i] === "=") {
        IDs[rpn[i - 2]] = rpn[i - 1];
        rpn.splice(i - 2, 3);
        i -= 2;
    }
    else if (rpn[i] === "output") {
        console.log(rpn.slice(i - 1 - rpn[i - 1], i - 1).map(function (idName) {
            return IDs[idName];
        }).join(", "));
        tempI = 2 + rpn[i - 1];
        rpn.splice(i - 1 - rpn[i - 1], 2 + rpn[i - 1]);
        i -= tempI;
    }
}