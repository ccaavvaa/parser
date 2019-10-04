import * as gulp from 'gulp';
import { GulpTaskParameter, setTaskMeta } from './gulp-helpers';
import * as mocha from 'gulp-mocha';

export async function test(done: GulpTaskParameter) {
    gulp.src('./test/**/*.specs.js')
        .pipe(mocha({
            reporter: 'spec',
        }))
        .on('error', done)
        .on('end', done);
}
