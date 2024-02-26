const
    DataStore          = exports,
    {name: identifier} = require('../../package.json'),
    assert             = require('@nrd/fua.core.assert');

assert(!global[identifier], 'unable to load a second uncached version of the singleton ' + identifier);
Object.defineProperty(global, identifier, {value: DataStore, configurable: false, writable: false, enumerable: false});

const
    _DataStore = Object.create(null),
    is         = require('@nrd/fua.core.is');

DataStore.initialize = async function (options = {}) {
    assert.object(options);
    assert(!_DataStore.initialized, 'already initialized');
    _DataStore.initialized = true;

    // TODO implement initializer

    return DataStore;
};

// TODO implement functionality

Object.freeze(DataStore);
module.exports = DataStore;
