"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable: no-console
const ts_morph_1 = require("ts-morph");
const typescript_1 = require("typescript");
const project = new ts_morph_1.Project({
    tsConfigFilePath: '/Projects/Phenix/AccessionRV/tsconfig.json',
});
const tc = project.getTypeChecker();
const ls = project.getLanguageService();
const src = project.getSourceFiles().find((s) => s.getFilePath().endsWith('synchro-societe.ts'));
let cSrc;
let stop = false;
src.forEachDescendant((n) => {
    if (!stop && typescript_1.isIdentifier(n.compilerNode)) {
        if (n.compilerNode.text === 't') {
            cSrc = n.getParent()
                .getParent()
                .getExpression().getChildren()[2].getSymbol().getDeclarations()[0].getParent().getSourceFile();
            stop = true;
            // console.log(n.getText());
            // const defs = (n as Identifier).getDefinitions();
            // if (defs.length) {
            //     console.log((n.getParent() as any).getParent()
            //    .getExpression().getChildren()[2].getType().getSymbol().compilerSymbol.parent.declarations[0].name);
            // }
        }
    }
});
const cls = cSrc.getClasses().find((c) => c.getName() === 'Container');
const method = cls.getMethod('t');
let cnt = 0;
for (const s of project.getSourceFiles()) {
    s.forEachDescendant((n) => {
        if (ts_morph_1.ts.isPropertyAccessExpression(n.compilerNode)) {
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
                if (defs[0].getDeclarationNode() === method) {
                    cnt++;
                    const callExpr = n.getParent().compilerNode;
                    const arg = callExpr.arguments[0];
                    if (ts_morph_1.ts.isStringLiteral(arg)) {
                        console.log(arg.text);
                    }
                    else {
                        console.error('+++ : "' + s.getFilePath() + c.getStartLineNumber());
                    }
                    console.log(n.getParent().getText());
                }
            }
        }
    });
}
console.log(cnt);
//# sourceMappingURL=parser.js.map