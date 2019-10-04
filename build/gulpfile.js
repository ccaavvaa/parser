"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gulp = require("gulp");
const compileTasks = require("./compile");
const testTasks = require("./test");
exports.compile = compileTasks.compile;
exports.test = testTasks.test;
exports.buildCompile = compileTasks.buildCompile;
exports.default = gulp.series(exports.compile, exports.test);
//# sourceMappingURL=gulpfile.js.map