const { Query } = require('mongoose');
const warnNoInit = require('./warnNoInit');

function extendQuery() {
    const exec = Query.prototype.exec;

    Query.prototype.cacheCalled = false; // Whether to contact redis at all

    Query.prototype.checkCache = true; // Whether to check redis cache for this query
    Query.prototype.cacheResult = true; // Whether to cache result for this query
    Query.prototype.cacheKey = undefined; // The key used to store the result in redis
    Query.prototype.cacheLifetime = undefined; // The lifetime of the cached result

    /**
     * Sets the lifetime and key of this query.
     * @param {number} lifetime
     * @param {string} key
     * @returns
     */
    Query.prototype.cache = function (lifetime, key) {
        if (Query.redisManager) {
            this.cacheCalled = true;
            this.cacheLifetime = lifetime;
            if (!this.cacheKey) this.setCacheKey(key);
        } else {
            warnNoInit();
        }
        return this;
    };

    /**
     * Sets the cache key for this query
     * @param {string} key
     * @returns
     */
    Query.prototype.setCacheKey = function (key) {
        if (Query.redisManager) {
            this.cacheCalled = true;
            if (!key) {
                key = JSON.stringify({
                    ...this.getQuery(),
                    collection: this.mongooseCollection.name,
                    op: this.op,
                    options: this.options
                });
            }
            this.cacheKey = key;
        } else {
            warnNoInit();
        }
        return this;
    };

    /**
     * Prevents this query from being cached to redis
     * @returns
     */
    Query.prototype.noSave = function () {
        this.cacheResult = false;
        return this;
    };

    /**
     * Does not check cache for this query/key
     * @returns
     */
    Query.prototype.force = function () {
        this.checkCache = false;
        return this;
    };

    /**
     * The default query executor with a caching twist
     * @returns
     */
    Query.prototype.exec = async function () {
        if (Query.redisManager) {
            const cacheValue =
                this.checkCache && this.cacheCalled
                    ? await Query.redisManager.get(this.cacheKey)
                    : undefined;

            if (cacheValue === undefined) {
                const result = await exec.apply(this, arguments);
                if (this.cacheResult && this.cacheCalled) {
                    Query.redisManager.set(this.cacheKey, result, this.cacheLifetime);
                }
                return result;
            } else if (cacheValue === null) {
                return cacheValue;
            } else {
                return this.model.hydrate(cacheValue);
            }
        } else {
            return exec.apply(this, arguments);
        }
    };
}

module.exports = extendQuery;
