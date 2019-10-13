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

    if (newData.length > 0) {
        const containedInKeys = newData.map((item) => {
            return item[key];
        });
        const containedData = await getData({
            dbName,
            query: {
                containedIn: [key, containedInKeys],
                select: [key],
            },
        });
        newData = differenceBy(newData, containedData, key);
    
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
    }

    return newData;
};

module.exports = {
    init,
    get,
    findAndSet,
};