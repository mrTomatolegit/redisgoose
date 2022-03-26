const { Model } = require('mongoose');

function resolveCacheString(arg, subcall = 0) {
    if (typeof arg === 'string') return arg;
    if (Array.isArray(arg)) {
        let str = arg.map(x => resolveCacheString(x, subcall + 1)).join(':');
        if (subcall !== 0) str = `[${str}]`;
        return str;
    }
    if (typeof arg === 'object') {
        let str = Object.entries(arg)
            .map(([k, v]) => `${k}=${resolveCacheString(v, subcall + 1)}`)
            .join(':');
        if (subcall !== 0) str = `{${str}}`;
        return str;
    }

    return new String(arg);
}

function extendModel() {
    /**
     *
     * @param {any[]} args The chaining arguments for the key
     * @returns {string}
     *
     * @example
     * ```js
     * makeCacheKey('name', 'test')
     * makeCacheKey('name=test')
     * makeCacheKey({ name: 'test' })
     * ```
     */
    Model.makeCacheKey = function (...args) {
        args = args.map(x => resolveCacheString(x));
        return `${this.modelName}:${args.join(':')}`;
    };
}

module.exports = extendModel;
