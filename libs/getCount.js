'use strict';

const isString = require('lodash/isString');
const AV = require('leanengine');

module.exports = async ({ dbName = '', }) => {
    if (!isString(dbName) || dbName === '') {
        throw 'dbName 不能为空';
    }

    const q = new AV.Query(dbName);
    return await q.count();
};