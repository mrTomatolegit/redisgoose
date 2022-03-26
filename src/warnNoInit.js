let warned = false;

module.exports = function () {
    if (!warned) {
        console.warn('RedisGoose not initialized');
        warned = true;
    }
};
