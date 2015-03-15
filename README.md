ZitRoLanguage translator
============================

A translator (in future - compiler) for fictional programming language - ZitRo language.

### Running
To translate program, run command this way: <code>node translate path/to/file.zrl</code>
Also you can specify additional parameter to change syntax analyzer analyze method, run <code>node translate path/to/file.zrl -analyzeMethod 2</code>

##### Follow this guide:
1. Run translator with <code>node translate test.zrl -analyzeMethod 2</code> (for example);
2. Make sure "program.zre" file created at <code>test</code> directory. If some errors occur, check the <code>test/translate.html</code> file contents.
3. Run <code>node execute test/program</code> to execute program. Today only mathematical calculations with "output" are supported.

### Testing
Run unit tests with <code>node runTests</code> command. 

### Example
Contents of <b>test.zrl</b> file:
```javascript
module test {
    var: a, b, c
    start
        b = 3;
        a = 2;
        c = 1;
        if [[a != (b + 10)] or not [b == 1] or [a <= 2]] or [not 1 >= 1] then
        do c=1 to b by a while [c >= 10] or [a < 5]
            do c=1 to b by a while c >= 10
                output: c
            end
        end;
        output: a
    end
}
```
