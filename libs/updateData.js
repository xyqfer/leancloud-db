'use strict';

const isString = require('lodash/isString');
const isObject = require('lodash/isObject');
const AV = require('leanengine');

module.exports = async ({ dbName = '', data = {}, id = '', }) => {
    if (!isString(dbName) || dbName === '') {
        throw 'dbName 不能为空';
    }

    if (!isObject(data)) {
        throw 'data 不能为空';
    }

    if (!isString(id) || id === '') {
        throw 'id 不能为空';
    }

    const dbObject = AV.Object.createWithoutData(dbName, id);

    Object.entries(data).forEach(([ key, value, ]) => {
        dbObject.set(key, value);
    });

    const result = await dbObject.save();
    return result.toJSON();
};