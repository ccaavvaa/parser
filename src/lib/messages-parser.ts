
import * as path from 'path';
import {
    Project, Identifier, SourceFile, ts, PropertyAccessExpression, MethodDeclaration
} from 'ts-morph';
import { isIdentifier } from 'typescript';

export interface MessagesExtractorOptions {
    tsConfigPath: string;
    onMessage: (messageInfo: MessageInfo) => void;
}
export interface MessageInfo {
    isError?: boolean;
    message?: string;
    file: string;
    line: number;
}
export class MessagesExtractor {
    private options: MessagesExtractorOptions;

    private project: Project;
    private method: MethodDeclaration;
    constructor(options: MessagesExtractorOptions) {
        this.options = options;
    }
    public execute(): Promise<void> {
        if (!this.options.onMessage) {
            return;
        }
        this.loadProject();

        for (const s of this.project.getSourceFiles()) {
            let sourceFilePath: string = null;
            s.forEachDescendant((n) => {
                if (!ts.isPropertyAccessExpression(n.compilerNode)) {
                    return;
                }
                const pae = n as PropertyAccessExpression;
                const children = pae.getChildrenOfKind(ts.SyntaxKind.Identifier) as Identifier[];
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
                    const callExpr = (n.getParent().compilerNode as any);
                    const arg = (callExpr.arguments[0] as any);

                    if (!sourceFilePath) {
                        sourceFilePath = s.getFilePath();
                    }
                    const messageInfo: MessageInfo = {
                        file: sourceFilePath,
                        line: c.getStartLineNumber(),
                    };
                    if (ts.isStringLiteral(arg)) {
                        messageInfo.message = arg.text;
                    } else {
                        messageInfo.isError = true;
                    }
                    this.options.onMessage(messageInfo);
                }
            });
        }
    }
    private loadProject() {
        if (!this.project) {
            const project = new Project({
                tsConfigFilePath: this.options.tsConfigPath,
            });
            const projectPath = path.dirname(this.options.tsConfigPath);
            project.getTypeChecker();
            project.getLanguageService();
            const src = project.createSourceFile(path.join(projectPath, 'xyz.ts'),
                "import * as boc from '@phoenix/boc';\n" +
                "function x(c: boc.Container) { return c.t('x');}"
            );
            try {
                let containerSrc: SourceFile;
                let stop = false;
                src.forEachDescendant((n) => {
                    if (!stop && isIdentifier(n.compilerNode)) {
                        if (n.compilerNode.text === 't') {
                            containerSrc = (n.getParent()
                                .getParent() as any)
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
            } finally {
                project.removeSourceFile(src);
            }
        }
    }
}
