ZitRoLanguage translator
============================

A translator (in future - compiler) for fictional programming language - ZitRo language.

### Running
To translate program, run command this way: <code>node translate path/to/file.zrl</code>
Also you can specify additional parameter to change syntax analyzer analyze method, run <code>node translate path/to/file.zrl -analyzeMethod 2</code>

### Testing
Run unit tests with <code>node runTests</code> command. 

### Example
Contents of <b>test.zrl</b> file:
```pascal
module test {
    var a, b, c;
    start
        b = 3;
        a = 2;
        c = 1;
        if [[a != (b + 10)] or not [b == 1] or [a <= 2]] or [not 1 >= 1] then
        do c=1 to b by a while (c >= 10)
            do c=1 to b by a while (c >= 10)
                output c;
            end;
        end;
        output a;
    end
}
```
1. Run translator with <code>node translate test.zrl -analyzeMethod 2</code>;
2. Check <code>test</code> directory and <code>test/translate.html</code> log.
