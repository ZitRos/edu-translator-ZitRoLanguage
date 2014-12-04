var exec = require("shelljs").exec,
    colors = require("colors");

var tests = [
        { file: "test1.zrl", code: 0 },
        { file: "test2.zrl", code: 0 },
        { file: "test3.zrl", code: 1 },
        { file: "test4.zrl", code: 0 },
        { file: "test5.zrl", code: 1 },
        { file: "test6.zrl", code: 2 },
        { file: "test7.zrl", code: 2 },
        { file: "test8.zrl", code: 2 },
        { file: "test9.zrl", code: 2 },
        { file: "test10.zrl", code: 0 },
        { file: "test11.zrl", code: 0 }
    ],
    passed = 0,
    result, i, a,
    logFlag = false;

process.argv.slice(2).every(function (el) {
    if (el === "--log") logFlag = true;
});

var test = function (args) {
    passed = 0;
    for (i = 0; i < tests.length; i++) {
        result = exec("node translate tests/" + tests[i].file
                + " -output tested/" + tests[i].file.slice(0, tests[i].file.lastIndexOf("."))
                + (args ? " " + args : ""),
            {silent: true});
        if (a = (result.code === tests[i].code)) passed++;
        if (!a || logFlag) console.log("\n---------------------- ".red + tests[i].file + "\n"
            + result.output + "\n----------------------\n".red);
        console.log((a ? "PASSED".green : "FAILED".red) + " #" + (i + 1) + " (" + tests[i].file
            + ");\t\t" + "Totally passed: " + passed + "/" + tests.length);
    }
    console.log("\n" + (tests.length === passed ?
        "All tests have been passed.".green : "Some tests have been failed.".red));
};

console.log("Testing for analyze method 1...".blue);
test();

console.log("\nTesting for analyze method 2...".blue);
test("-analyzeMethod 2");

