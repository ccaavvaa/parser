import * as fs from 'fs';
import * as path from 'path';
import 'mocha';
const myTestToDebug = fs.existsSync(path.join(__dirname, 'my-debug-test.js')) ?
    // tslint:disable-next-line:no-var-requires
    require('./my-debug-test').testToDebug : null;

// to debug all:
// const testToDebug: string = null;
// to test only test 'y' in suite 'x':
// const testToDebug = 'x y';

const testToDebug: string = myTestToDebug;

beforeEach(function () {
    // tslint:disable-next-line:no-this-assignment
    const that: any = this;
    if (process.env.DEBUG_TEST === 'true' && testToDebug) {
        const fullTestTitle = getFullTitle(that.currentTest);
        if (fullTestTitle.search(testToDebug) < 0) {
            this.skip();
        }
    }
});

function getFullTitle(test: any): string {
    const titles: string[] = [];
    let current = test;
    while (current) {
        if (current.title) {
            titles.push(current.title);
        }
        current = current.parent;
    }
    return titles.reverse().join(' ');
}
