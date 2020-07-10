"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messages_parser_1 = require("./messages-parser");
// tslint:disable: no-console
let cnt = 0;
const me = new messages_parser_1.MessagesExtractor({
    tsConfigPath: '/Projects/Phenix/AccessionRV/tsconfig.json',
    onMessage: (i) => {
        cnt++;
        if (cnt % 100 === 0) {
            console.log(cnt);
            return false;
        }
        if (i.isError) {
            console.error(`${i.file}:${i.line}`);
        }
        return true;
    },
});
me.execute();
console.log(cnt);
//# sourceMappingURL=parser.js.map