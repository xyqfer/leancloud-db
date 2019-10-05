'use strict';

const isString = require('lodash/isString');
const difference = require('lodash/difference');
const getData = require('./getData');
const setHook = require('./setHook');

module.exports = async ({ 
    dbName = '', 
    useHook = true, 
    interval = 5 * 60 * 1000, 
    key = 'key', 
    value = 'value', 
}) => {
    if (!isString(dbName) || dbName === '') {
        throw 'dbName 不能为空';
    }

    let keySet = new Set();
    const setEnv = (envData) => {
        let newKeySet = new Set();
        envData.forEach((data) => {
            const k = data[key];
            const v = data[value];

            process.env[k] = v;
            newKeySet.add(k);
        });

        difference([...keySet], [...newKeySet]).forEach((key) => {
            delete process.env[key];
        });
        keySet = newKeySet;
    };
    const updateEnv = async () => {
        const envData = await getData({
            dbName,
        });
        setEnv(envData);
    };
    await updateEnv();

    if (useHook) {
        setHook({
            dbName,
            hookName: ['afterSave', 'afterUpdate', 'afterDelete'],
            cb: ({ object }, hookName) => {
                const k = object.get(key);
                const v = object.get(value);

                if (hookName === 'afterDelete') {
                    delete process.env[k];
                } else {
                    process.env[k] = v;
                }
            },
        });
    } else {
        const syncEnv = () => {
            setTimeout(async () => {
                await updateEnv();
                syncEnv();
            }, interval);
        };
        syncEnv();
    }
};