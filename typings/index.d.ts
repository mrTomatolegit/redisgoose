import Cacheman from 'recacheman-redis';
import { Model } from 'mongoose';

declare module 'mongoose' {
    namespace Query {
        /**
         * The redis manager initialised
         */
        export const redisManager: RedisManager;
    }

    interface Model<T, TQueryHelpers = {}, TMethodsAndOverrides = {}, TVirtuals = {}> {
        /**
         *
         * @param {any} arg The key/values object for the key
         * @returns {string}
         *
         * @example
         * ```js
         * makeCacheKey('name=test', 'foo=bar')
         * makeCacheKey(['name=test', 'foo=bar'])
         * makeCacheKey({ name: 'test', foo: 'bar' })
         * ```
         */
        makeCacheKey(...args: any[]): string;
    }

    interface Query<ResultType, DocType, THelpers = {}, RawDocType = DocType> {
        /**
         * Indicates the lifetime and may indicate the key
         *
         * This is required to cache a query to redis and to get the cached result
         *
         * If set to `-1` then it will never uncache
         *
         * Sets `cacheResult` to true
         * @param lifetime The lifetime in seconds
         * @param key The string to use as a key (recommended)
         */
        cache(lifetime: number, key?: string): this;

        /**
         * This bypasses checking Redis cache and requests MongoDB directly
         *
         * Sets `checkCache` to false
         *
         * Implemented for convenience/function chaining
         */
        force(): this;

        /**
         * This prevents saving the query result to Redis
         *
         * Sets `cacheResult` to false
         *
         * Implemented for convenience/function chaining
         */
        noSave(): this;

        /**
         * Sets the cache key
         *
         * The difference with `.cache` is that this doesn't required a lifetime
         *
         * This can be used if you need to `checkCache` but not `cacheResult`
         * noSave still needs to be called explicitly to prevent saving
         *
         * @param key The key to use for the cache
         */
        setCacheKey(key?: string): this;

        /**
         * Whether to check Redis cache when executing a query
         */
        checkCache: boolean;

        /**
         * Whether the .cache method has been called
         */
        cacheCalled: boolean;

        /**
         * The key to cache the result with
         *
         * This will default to `JSON.stringify(queryData)`
         */
        cacheKey?: string;

        /**
         * The lifetime for the cached result in Redis memory
         */
        cacheLifetime?: number;

        /**
         * Whether to cache the result to Redis when the query is completed
         */
        cacheResult: boolean;
    }
}

declare class RedisManager {
    constructor(cacheman: Cacheman);
    public client: Cacheman;
    public get(key: string): Promise<object | null | undefined>;
    public set(key: string, value: any, ttl: number): Promise<void>;
    public del(key: string): Promise<void>;
    public clear(): Promise<number>;
    public disconnect(flush?: boolean): void;
}

type ClientConfiguration = {
    socket?: {
        port?: number;
        host?: string;
        family?: 4 | 6 | 0;
        path?: string;
        connectTimeout?: number;
        noDelay?: boolean;
        keepAlive?: number;
        tls?: boolean;
        reconnectStrategy?(retries: number): number | Error;
    };
    port: number;
    host: string;
    client?: RedisClient;
    prefix?: string;
    username?: string;
    password?: string;
    name?: string;
    database?: number;
    modules?: object;
    scripts?: object;
    commandQueueMaxLength?: number;
    disableOfflineQueue?: boolean;
    readonly?: boolean;
    legacyMode?: boolean;
    isolationPoolOptions?: object;
};

type RedisClient = {};

declare function init(options: string | RedisClient | ClientConfiguration): void;

declare namespace init {
    export function clearCache(key?: string): Promise<number>;
    export const redisManager: RedisManager;
}
export = init;
