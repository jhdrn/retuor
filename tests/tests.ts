
/// <reference path="../libs/DefinitelyTyped/qunit/qunit.d.ts" />
/// <reference path="../src/retuor.ts" />

test("complex path", function () {
    var result;
    retuor.route('foo/*/bar/{id}/{*path}', (id: number, path: string) => {
        result = id + path;
    });

    var path = '/foo/baz/bar/7962/some/path';
    var w = {
        location: {
            pathname: path
        }
    };
    retuor.run(w);
    equal(result, '7962some/path');
});
test("wildcard path", function () {
    var result;
    retuor.route('{*path}', (path) => {
        result = path;
    });
    var path = '/this/is/just.a.random/string';
    var w = {
        location: {
            pathname: path
        }
    };
    retuor.run(w);
    equal(result, path.substr(1));
});
test("default path", function () {
    var result;
    retuor.route(() => {
        result = '';
    });

    var path = '/';
    var w = {
        location: {
            pathname: path
        }
    };

    retuor.run(w);
    equal(result, path.substr(1));

});
