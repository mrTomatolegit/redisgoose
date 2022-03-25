import Cacheman from 'recacheman-redis';

declare module 'mongoose' {
    interface Query<ResultType, DocType, THelpers = {}, RawDocType = DocType> {
        checkCache: boolean;
        cacheResult: boolean;
        cacheKey?: string;
        cacheLifetime?: number;
        cache(lifetime: number, key?: string): this;
        setCacheKey(key: string): this;
        noSave(): this;
        force(): this;
    }

    namespace Query {
        export const redisManager: RedisManager;
    }
}

declare class RedisManager {
    constructor(cacheman: Cacheman);
    public client: Cacheman;
    public get(key: string): Promise<object | null | undefined>;
    public set(key: string, value: any, ttl: number): Promise<void>;
    public del(key: string): Promise<void>;
    public clear(): Promise<void>;
}

declare function init(options: any): void;

declare namespace init {
    export function clearCache(key: string): Promise<void>;
}

export = init;
