var colors = require("colors"),
    temp,
    ds = __dirname.indexOf("/") === -1 ? "\\" : "/",
    args = process.argv.slice(2),
    flags = args.slice(1) || [],
    file,
    filename,
    outputName = args[0].slice((temp = args[0].lastIndexOf("/")) !== -1 ? temp + 1 : 0, args[0].lastIndexOf(".")),
    fs = require("fs"),
    error,
    lexicalAnalyzer = new (require("./modules/LexicalAnalyzer")),
    syntaxAnalyzer = new (require("./modules/SyntaxAnalyzer")),
    translation;

console.log("\x1B[1m- ZitRoLang Translator v0.4 by ZitRo -\x1B[0m\n".blue);

var removeFolder = function (path) {
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file) {
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) {
                removeFolder(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

temp = flags;
flags = {};
temp.forEach(function (a, b, c) {
    if (a.charAt(0) === "-" && b + 1 < c.length) {
        flags[a] = c[b + 1]
    }
});

// change analyzing mechanism
if (flags["-analyzeMethod"] == 2) {
    syntaxAnalyzer = new (require("./modules/SyntaxAnalyzer2"));
}

if (args.length < 1) {
    console.error("Please, specify source file.\r\n" +
        "Example of usage: $\x1B[1m node translate test.zrl [output directory name]\x1B[0m");
    process.exit(0);
}

try {
    file = fs.readFileSync(args[0]).toString();
} catch (e) {
    console.error("Unable to open file " + args[0]);
    return;
}

if (flags["-output"]) { outputName = flags["-output"] }

if (fs.existsSync(outputName) && outputName !== "translate.js"
    && outputName.substr(0, 7) !== "modules") {
    removeFolder(outputName);
}
fs.mkdirSync(outputName);

console.log("Destination: " + __dirname + ds + outputName + ds);
translation = lexicalAnalyzer.parse(file);

if (!translation.error) {
    filename = outputName + "/translate.html";
} else {
    console.error("An error occurred when analysing syntax.", translation.error);
    process.exit(1);
}

if (typeof syntaxAnalyzer.check !== "function") {
    console.error("Syntax analyzer module issue: not implemented \"check\" method.");
    process.exit(-1);
}

error = (temp = syntaxAnalyzer.check(translation) || {}).error;

lexicalAnalyzer.logHTML(file, filename, translation, "<hr/>" +
    (error ? "<h1 style=\"text-shadow: 0 0 2px red;\">Syntax analyzer reported an error.</h1><p>"
            + error + "</p>"
            : "<h1 style=\"text-shadow: 0 0 2px green;\">" +
            "No errors were found by syntax analyzer.</h1>")
    + "<div>" + (temp.html || "") + "</div>");

if (error) {
    console.error(error);
    process.exit(2);
}

console.log("Successfully completed.");