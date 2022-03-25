const Cacheman = require('recacheman-redis');
const { Query } = require('mongoose');
const RedisManager = require('./src/RedisManager');
const extendQuery = require('./src/extendQuery');

module.exports = function (options) {
    const cacheman = new Cacheman(options);
    const redisManager = new RedisManager(cacheman);
    extendQuery(redisManager);
};

module.exports.clearCache = async function (key) {
    if (!Query.redisManager) throw new Error('RedisGoose not initialized');
    if (!key) return Query.redisManager.clear();
    else return Query.redisManager.del(key);
};
