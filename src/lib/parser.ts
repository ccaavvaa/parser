import { MessagesExtractor } from './messages-parser';
// tslint:disable: no-console
let cnt = 0;
const me = new MessagesExtractor({
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
