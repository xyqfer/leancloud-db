'use strict';

const AV = require('leanengine');
const isString = require('lodash/isString');

module.exports = async ({ dbName = '', limit = 1000, query = {}, cache = false, }) => {
    if (!isString(dbName) || dbName === '') {
        throw 'dbName 不能为空';
    }

    const q = new AV.Query(dbName);

    if (!query.descending && !query.ascending && !query.addAscending && !query.addDescending) {
        query.descending = ['createdAt'];
    }

    Object.entries(query).forEach(([ key, params, ]) => {
        if (isString(params)) {
            params = [params];
        }

        q[key].apply(q, params);
    });

    q.limit(limit);

    const data = await q.find();
    return data.map((item) => {
        return item.toJSON();
    });
};