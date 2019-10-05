const AV = require('leanengine');
const isString = require('lodash/isString');
const hookSet = new Set();

module.exports = async ({ dbName = '', hookName = [], cb = () => {}, }) => {
    if (!isString(dbName) || dbName === '') {
        throw 'dbName 不能为空';
    }

    if (isString(hookName)) {
        hookName = [hookName];
    }

    hookName.forEach((name) => {
        const setItem = `${dbName}+${name}`;
        if (!hookSet.has(setItem)) {
            hookSet.add(setItem);

            AV.Cloud[name](dbName, async (request) => {
                return await cb(request, name);
            });
        }
    });
};