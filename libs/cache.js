const Promise = require('bluebird');
const differenceBy = require('lodash/differenceBy');
const getData = require('./getData');
const saveData = require('./saveData');

const cacheMap = new Map();

const init = async ({ dbName, query, count, }) => {
    let data;
    if (!cacheMap.has(dbName)) {
        data = await getData({
            dbName,
            query,
            limit: count,
        });
        cacheMap.set(dbName, data || []);
    } else {
        data = cacheMap.get(dbName);
    }

    return data;
};

const get = async ({ dbName, }) => {
    return cacheMap.get(dbName) || [];
};

const findAndSet = async ({ dbName, source, key, }) => {
    const dbData = cacheMap.get(dbName);
    let newData = differenceBy(source, dbData, key);

    newData = await Promise.filter(newData, async (item) => {
        const dbItem = await getData({
            dbName,
            limit: 1,
            query: {
                equalTo: [key, item[key]],
            },
        });

        return dbItem.length === 0;
    }, {
        concurrency: 1,
    });

    if (newData.length > 0) {
        const mapData = cacheMap.get(dbName);
        newData.forEach((data) => {
            mapData.unshift(data);
        });

        await saveData({
            dbName,
            data: newData,
        });
    }

    return newData;
};

module.exports = {
    init,
    get,
    findAndSet,
};