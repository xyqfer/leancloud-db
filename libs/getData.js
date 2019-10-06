'use strict';

const AV = require('leanengine');
const Promise = require('bluebird');
const _ = require('lodash');

const getData = async ({ dbName, limit, query, }) => {
    const q = new AV.Query(dbName);

    if (!query.descending && !query.ascending && !query.addAscending && !query.addDescending) {
        query.descending = ['createdAt'];
    }

    Object.entries(query).forEach(([ key, params, ]) => {
        if (_.isString(params)) {
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
const MAX_PER_TIME = 1000;

module.exports = async ({ dbName = '', limit = MAX_PER_TIME, query = {}, }) => {
    if (!_.isString(dbName) || dbName === '') {
        throw 'dbName 不能为空';
    }

    let skip = 0;
    if (query.skip) {
        if (_.isString(query.skip)) {
            query.skip = [query.skip];
        }
        skip = query.skip[0];
    }

    const times = Math.floor(limit / MAX_PER_TIME);
    const offsets = _.times(times, _.constant(MAX_PER_TIME));
    const remaining = limit - times * MAX_PER_TIME;
    offsets.push(remaining);

    const dbData = await Promise.mapSeries(offsets, async (offset) => {
        const dbData = await getData({
            dbName,
            limit: offset,
            query,
        });

        skip += offset;
        query.skip = [skip];
        return dbData;
    });

    return _.flattenDeep(dbData);
};