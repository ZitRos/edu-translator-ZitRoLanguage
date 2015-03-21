ZitRoLanguage translator
============================

A translator (in future - compiler) for fictional programming language - ZitRo language.

### Running
To translate and compile the program, run command this way: <code>node translate path/to/file.zrl</code>
Also you can specify additional parameters to change syntax analyzer analyze method, try <code>node translate path/to/file.zrl -analyzeMethod 2</code> (also available <code>-analyzeMethod 1</code>)

##### Follow this guide:
1. Run translator with <code>node translate test.zrl -analyzeMethod 2</code> (for example);
2. Make sure "program.zre" file has been created at <code>test</code> directory. If some errors occur, check the <code>test/translate.html</code> file contents and console output.
3. Run <code>node execute test/program</code> to execute program.

### Testing
Run unit tests with <code>node runTests</code> command.

### Example
Contents of <b>test.zrl</b> file:
```javascript
module test {
    var: a, b, c, d
    start
        b = 3;
        a = 2;
        if [[a != (b + 10)] or not [b == 1] or [a <= 2]] or [not 1 >= 1] then
        for c=1 to b by a while [c >= 10] or [a < 5] do
            for d=1 to b by a while d <= 10 do
                output: c, d
            end
        end;
        output: a
    end
}
```

1. <code>node translate test.zrl -analyzeMethod 2</code>
2. <code>node execute test/program</code>

Output:
```
1, 1
1, 3
3, 1
3, 3
2
```
