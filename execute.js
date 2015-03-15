/**
 * This module allows to execute *.zre files.
 */
var fs = require("fs"),
    args = process.argv.slice(2),
    file = args[0],
    content, rpn, IDs, CONSTs, i;

if (file.match(/.*\.zre$/) === null) file += ".zre";
if (!fs.existsSync(file)) { console.error("File '%s' not found.", file); }

try {
    content = JSON.parse(fs.readFileSync((file[0] === "/" ? file : __dirname + "/" + file)));
} catch (e) { console.error("Executable file parse error: %s", e.message); }

rpn = content.rpn;
IDs = content.id;
CONSTs = content.const;

var val = function (i) { if (typeof rpn[i] === "number") return rpn[i]; else return IDs[rpn[i]]; };

for (i = 0; i < rpn.length; i++) {
    if (rpn[i] === "+") { rpn.splice(i - 2, 3, val(i - 2) + val(i - 1)); i -= 2; }
    else if (rpn[i] === "-") { rpn.splice(i - 2, 3, val(i - 2) - val(i - 1)); i -= 2; }
    else if (rpn[i] === "*") { rpn.splice(i - 2, 3, val(i - 2) * val(i - 1)); i -= 2; }
    else if (rpn[i] === "/") { rpn.splice(i - 2, 3, val(i - 2) / val(i - 1)); i -= 2; }
    else if (rpn[i] === "^") { rpn.splice(i - 2, 3, Math.pow(val(i - 2), val(i - 1))); i -= 2; }
    else if (rpn[i] === "=") {
        IDs[rpn[i - 2]] = rpn[i - 1];
        rpn.splice(i - 2, 3);
        i -= 2;
    }
    else if (rpn[i] === "output") {
        console.log(rpn.slice(i - 1 - rpn[i - 1], i - 1).map(function (idName) {
            return IDs[idName];
        }).join(", "));
        i -= 2 - rpn[i - 1];
        rpn.splice(i - 1 - rpn[i - 1], 2 + rpn[i - 1]);
    }
}