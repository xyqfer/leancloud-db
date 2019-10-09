'use strict';

const isString = require('lodash/isString');
const Promise = require('bluebird');
const AV = require('leanengine');
const getData = require('./getData');

module.exports = async ({ dbName = '', update = [], }) => {
    if (!isString(dbName) || dbName === '') {
        throw 'dbName 不能为空';
    }

    return await Promise.mapSeries(update, async ({ query, data, }) => {
        const dbData = await getData({
            dbName,
            query,
            limit: 1,
        });

        if (dbData.length > 0) {
            const dbObject = AV.Object.createWithoutData(dbName, dbData[0].objectId);

            Object.entries(data).forEach(([ key, value, ]) => {
                dbObject.set(key, value);
            });

            const result = await dbObject.save();
            return result.toJSON();
        }
    });
};