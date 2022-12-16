interface ChangelogOptions {
    file?: string;
    releaseCount?: number;
}
export declare const changelog: ({ file, releaseCount, }?: ChangelogOptions) => Promise<void>;
export {};
