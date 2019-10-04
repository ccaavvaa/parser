"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
require("mocha");
const myTestToDebug = fs.existsSync(path.join(__dirname, 'my-debug-test.js')) ?
    // tslint:disable-next-line:no-var-requires
    require('./my-debug-test').testToDebug : null;
// to debug all:
// const testToDebug: string = null;
// to test only test 'y' in suite 'x':
// const testToDebug = 'x y';
const testToDebug = myTestToDebug;
beforeEach(function () {
    // tslint:disable-next-line:no-this-assignment
    const that = this;
    if (process.env.DEBUG_TEST === 'true' && testToDebug) {
        const fullTestTitle = getFullTitle(that.currentTest);
        if (fullTestTitle.search(testToDebug) < 0) {
            this.skip();
        }
    }
});
function getFullTitle(test) {
    const titles = [];
    let current = test;
    while (current) {
        if (current.title) {
            titles.push(current.title);
        }
        current = current.parent;
    }
    return titles.reverse().join(' ');
}
//# sourceMappingURL=debug-test.js.map