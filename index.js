const Cacheman = require('recacheman-redis');
const { Query } = require('mongoose');
const RedisManager = require('./src/RedisManager');
const extendQuery = require('./src/extendQuery');
const extendModel = require('./src/extendModel');
const warnNoInit = require('./src/warnNoInit');

extendModel();
extendQuery();

module.exports = function (options) {
    const cacheman = new Cacheman(options);
    const redisManager = new RedisManager(cacheman);
    Query.redisManager = redisManager;
};

module.exports.clearCache = async function (key) {
    if (!Query.redisManager) return warnNoInit();
    if (!key) return Query.redisManager.clear();
    else return Query.redisManager.del(key);
};

Object.defineProperty(module.exports, 'redisManager', {
    get: function () {
        return Query.redisManager;
    }
});
