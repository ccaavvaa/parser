"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesExtractor = void 0;
const path = require("path");
const ts_morph_1 = require("ts-morph");
const typescript_1 = require("typescript");
class MessagesExtractor {
    constructor(options) {
        this.options = options;
    }
    execute() {
        if (!this.options.onMessage) {
            return;
        }
        this.loadProject();
        for (const s of this.project.getSourceFiles()) {
            let sourceFilePath = null;
            s.forEachDescendant((n) => {
                if (!ts_morph_1.ts.isPropertyAccessExpression(n.compilerNode)) {
                    return;
                }
                const pae = n;
                const children = pae.getChildrenOfKind(ts_morph_1.ts.SyntaxKind.Identifier);
                for (const c of children) {
                    if (c.compilerNode.text !== 't') {
                        continue;
                    }
                    const defs = c.getDefinitions();
                    if (!defs.length) {
                        continue;
                    }
                    if (defs[0].getDeclarationNode() !== this.method) {
                        continue;
                    }
                    const callExpr = n.getParent().compilerNode;
                    const arg = callExpr.arguments[0];
                    if (!sourceFilePath) {
                        sourceFilePath = s.getFilePath();
                    }
                    const messageInfo = {
                        file: sourceFilePath,
                        line: c.getStartLineNumber(),
                    };
                    if (ts_morph_1.ts.isStringLiteral(arg)) {
                        messageInfo.message = arg.text;
                    }
                    else {
                        messageInfo.isError = true;
                    }
                    this.options.onMessage(messageInfo);
                }
            });
        }
    }
    loadProject() {
        if (!this.project) {
            const project = new ts_morph_1.Project({
                tsConfigFilePath: this.options.tsConfigPath,
            });
            const projectPath = path.dirname(this.options.tsConfigPath);
            project.getTypeChecker();
            project.getLanguageService();
            const src = project.createSourceFile(path.join(projectPath, 'xyz.ts'), "import * as boc from '@phoenix/boc';\n" +
                "function x(c: boc.Container) { return c.t('x');}");
            try {
                let containerSrc;
                let stop = false;
                src.forEachDescendant((n) => {
                    if (!stop && typescript_1.isIdentifier(n.compilerNode)) {
                        if (n.compilerNode.text === 't') {
                            containerSrc = n.getParent()
                                .getParent()
                                .getExpression().getChildren()[2]
                                .getSymbol().getDeclarations()[0]
                                .getParent().getSourceFile();
                            stop = true;
                        }
                    }
                });
                const cls = containerSrc.getClasses().find((c) => c.getName() === 'Container');
                const method = cls.getMethod('t');
                this.project = project;
                this.method = method;
            }
            finally {
                project.removeSourceFile(src);
            }
        }
    }
}
exports.MessagesExtractor = MessagesExtractor;
//# sourceMappingURL=messages-parser.js.map