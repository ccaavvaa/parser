"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const fs = require("fs");
const path = require("path");
const util_1 = require("util");
const messages_parser_1 = require("./messages-parser");
// tslint:disable: no-console
commander_1.program
    .version('0.0.1', '-V, --version', 'Output version')
    .requiredOption('-p, --path <tsconfig>', 'Project path')
    .requiredOption('-o, --output <output>', 'Output file name')
    .option('-v, --verbose')
    .option('-t, --top', 'First message for test')
    .parse();
async function execute() {
    let projectPath = commander_1.program.path;
    if (!projectPath) {
        throw new Error('Project path is required. Use --path option');
    }
    const exists = util_1.promisify(fs.exists);
    if (!await exists(projectPath)) {
        throw new Error(`Invalid path: ${projectPath}`);
    }
    const stat = util_1.promisify(fs.stat);
    const stats = await stat(projectPath);
    if (stats.isDirectory) {
        projectPath = path.join(projectPath, 'tsconfig.json');
    }
    if (commander_1.program.verbose) {
        console.log(`Using ${projectPath}`);
    }
    const messages = {};
    let cnt = 0;
    const me = new messages_parser_1.MessagesExtractor({
        tsConfigPath: projectPath,
        onMessage: (i) => {
            cnt++;
            if (i.isError) {
                console.error(`Erreur: ${i.file}:${i.line}`);
            }
            else {
                messages[i.message] = { message: i.message };
            }
            if (commander_1.program.verbose) {
                if (cnt % 100 === 0) {
                    console.log(cnt);
                }
            }
            return !commander_1.program.top;
        },
    });
    me.execute();
    const s = JSON.stringify(messages, null, '\t');
    const writeFile = util_1.promisify(fs.writeFile);
    if (commander_1.program.verbose) {
        console.log(`Writing: ${cnt} messages to ${commander_1.program.output}`);
    }
    await writeFile(commander_1.program.output, s, {
        encoding: 'utf8',
    });
    if (commander_1.program.verbose) {
        console.log('Done.');
    }
}
execute().catch((e) => {
    console.error(e.message || e);
    process.exit(-1);
});
//# sourceMappingURL=app.js.map