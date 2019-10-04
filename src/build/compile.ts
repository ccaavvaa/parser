import { exec } from 'child_process';
import del from 'del';
import * as fancyLog from 'fancy-log';
import * as gulp from 'gulp';
import { GulpTaskParameter, setTaskMeta, trim, logExecOutput } from './gulp-helpers';
const tscCmd = 'npm run tsc --';
const compilerOutputGlobs = ['js', 'd.ts', 'map'].map(s => `/**/*.${s}`);

const compilerOutputFolders = [
    './lib',
    './test',
];
const buildOutputFolders = [
    './build',
];

export function deleteCompilerOutput(done: GulpTaskParameter) {
    return removeCompilerOutput(compilerOutputFolders);
}
setTaskMeta(deleteCompilerOutput, 'Delete compiler output');

export async function deleteBuildCompileOutput(done: GulpTaskParameter) {
    return removeCompilerOutput(buildOutputFolders);
}
setTaskMeta(deleteBuildCompileOutput, 'Delete compiler output');

export function tsc(done: GulpTaskParameter): void {
    tscProject(done);
}
setTaskMeta(tsc, 'Compile typescript sources');
export function buildTsc(done: GulpTaskParameter): void {
    tscProject(done, './tsconfig-build.json');
}
setTaskMeta(buildTsc, 'Compile build sources');

export function lint(done: GulpTaskParameter): void {
    tslintProject(done, './tsconfig.json');
}
setTaskMeta(lint, 'Linting typescript sources');
export function buildLint(done: GulpTaskParameter): void {
    tslintProject(done, './tsconfig-build.json');
}
setTaskMeta(lint, 'Linting typescript sources');

export const compile = gulp.series(deleteCompilerOutput, lint, tsc);
export const buildCompile = gulp.series(deleteBuildCompileOutput, buildLint, buildTsc);

function tscProject(done: GulpTaskParameter, tsconfigFile?: string): void {
    exec(tscCmd + ' --version', (err, stdout, stderr) => {
        logExecOutput(err, 'Compiling using TypeScript ' + stdout, stderr);
        stdout = trim(stdout);
        if (err) {
            done(err);
        } else {
            const cmdElements = [tscCmd];
            if (tsconfigFile) {
                cmdElements.push(`-p ${tsconfigFile}`);
            }
            // tslint:disable-next-line:no-shadowed-variable
            exec(cmdElements.join(' '), (err, stdout, stderr) => {
                logExecOutput(err, stdout, stderr);
                done(err);
            });
        }
    });
}
function tslintProject(done: GulpTaskParameter, tsconfigFile?: string): void {
    exec('tslint --version', (err, stdout, stderr) => {
        logExecOutput(err, 'Linting using tslint '.concat(stdout), stderr);
        if (err) {
            done(err);
        } else {
            // tslint:disable-next-line:no-shadowed-variable
            const cmdElements = ['tslint -c tslint.json -t prose'];
            if (tsconfigFile) {
                cmdElements.push(`-p ${tsconfigFile}`);
            }
            // tslint:disable-next-line:no-shadowed-variable
            exec(cmdElements.join(' '), (err, stdout, stderr) => {
                logExecOutput(err, stdout, stderr);
                done(err);
            });
        }
    });
}

async function removeCompilerOutput(folders: string[]) {
    folders.forEach(s => fancyLog.info(s));
    const patterns = folders.reduce<string[]>((p, v) => {
        p.push(...compilerOutputGlobs.map(s => v.concat(s)));
        return p;
    }, []);
    return del(patterns);
}
