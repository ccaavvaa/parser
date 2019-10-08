// tslint:disable: no-console
import {
    Project, Identifier, SourceFile, ts, PropertyAccessExpression
} from 'ts-morph';
import { CallExpression, isIdentifier } from 'typescript';
const project = new Project({
    tsConfigFilePath: '/Projects/Phenix/AccessionRV/tsconfig.json',
});
const tc = project.getTypeChecker();
const ls = project.getLanguageService();
const src = project.getSourceFiles().find((s) => s.getFilePath().endsWith('synchro-societe.ts'));
let cSrc: SourceFile;
let stop = false;
src.forEachDescendant((n) => {
    if (!stop && isIdentifier(n.compilerNode)) {
        if (n.compilerNode.text === 't') {
            cSrc = (n.getParent()
                .getParent() as any)
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
        if (ts.isPropertyAccessExpression(n.compilerNode)) {
            const pae = n as PropertyAccessExpression;
            const children = pae.getChildrenOfKind(ts.SyntaxKind.Identifier) as Identifier[];
            for (const c of children) {
                const defs = c.getDefinitions();
                if (!defs.length) {
                    continue;
                }
                if (c.compilerNode.text === 't' && c.getDefinitions()[0].getDeclarationNode() === method) {
                    cnt++;
                    const callExpr = (n.getParent().compilerNode as any);
                    const arg = (callExpr.arguments[0] as any);
                    if (ts.isStringLiteral(arg)) {
                        console.log(arg.text);
                    } else {
                        console.error('+++ : "' + s.getFilePath() + c.getStartLineNumber());
                    }
                    console.log(n.getParent().getText());
                }
            }
        }
    });
}
console.log(cnt);
