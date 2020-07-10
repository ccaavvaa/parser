import { program } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { MessagesExtractor, MessageInfo } from './messages-parser';
// tslint:disable: no-console
program
    .version('0.0.1', '-V, --version', 'Output version')
    .requiredOption('-p, --path <tsconfig>', 'Project path')
    .requiredOption('-o, --output <output>', 'Output file name')
    .option('-v, --verbose')
    .option('-t, --top', 'First message for test')
    .parse();

async function execute() {
    let projectPath = program.path;
    if (!projectPath) {
        throw new Error('Project path is required. Use --path option');
    }
    const exists = promisify(fs.exists);
    if (!await exists(projectPath)) {
        throw new Error(`Invalid path: ${projectPath}`);
    }

    const stat = promisify(fs.stat);
    const stats = await stat(projectPath);
    if (stats.isDirectory) {
        projectPath = path.join(projectPath, 'tsconfig.json');
    }
    if (program.verbose) {
        console.log(`Using ${projectPath}`);
    }
    const messages: { [key: string]: { message: string } } = {};
    let cnt = 0;
    const me = new MessagesExtractor({
        tsConfigPath: projectPath,
        onMessage: (i) => {
            cnt++;
            if (i.isError) {
                console.error(`Erreur: ${i.file}:${i.line}`);
            } else {
                messages[i.message] = { message: i.message };
            }
            if (program.verbose) {
                if (cnt % 100 === 0) {
                    console.log(cnt);
                }
            }
            return !program.top;
        },
    });
    me.execute();
    const s = JSON.stringify(messages, null, '\t');
    const writeFile = promisify(fs.writeFile);
    if (program.verbose) {
        console.log(`Writing: ${cnt} messages to ${program.output}`);
    }
    await writeFile(program.output, s, {
        encoding: 'utf8',
    });
    if (program.verbose) {
        console.log('Done.');
    }
}
execute().catch((e) => {
    console.error(e.message || e);
    process.exit(-1);
});
