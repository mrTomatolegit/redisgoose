const redisgoose = require('../index');
const mongoose = require('mongoose');
redisgoose('redis://127.0.0.1:6379');

const Sample = mongoose.model('sample', new mongoose.Schema({ name: String }));

const main = async function () {
    console.log('Trying to connect to mongodb');
    await mongoose.connect('mongodb://127.0.0.1/test');
    console.log('Connected to mongodb', mongoose.Query.redisManager);
    const r1 = await Sample.findOne({ name: 'test' }).cache(1000, 'Sample:name=test').exec();
    console.log(r1);
    if (!r1) {
        await Sample.create({ name: 'test' });
    }
    const r2 = await Sample.findOne({ name: 'test' }).cache(1000, 'Sample:name=test');
    console.log(r2);
    redisgoose.clearCache('Sample:name=test');
};

main();
