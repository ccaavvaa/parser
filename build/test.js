"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.test = void 0;
const gulp = require("gulp");
const mocha = require("gulp-mocha");
async function test(done) {
    gulp.src('./test/**/*.specs.js')
        .pipe(mocha({
        reporter: 'spec',
    }))
        .on('error', done)
        .on('end', done);
}
exports.test = test;
//# sourceMappingURL=test.js.map