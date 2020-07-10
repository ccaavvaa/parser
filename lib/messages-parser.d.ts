export interface MessagesExtractorOptions {
    tsConfigPath: string;
    onMessage: (messageInfo: MessageInfo) => boolean;
}
export interface MessageInfo {
    isError?: boolean;
    message?: string;
    file: string;
    line: number;
}
export declare class MessagesExtractor {
    private options;
    private project;
    private method;
    constructor(options: MessagesExtractorOptions);
    execute(): void;
    private loadProject;
}
