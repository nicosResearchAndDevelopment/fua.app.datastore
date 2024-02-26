const
    DataStore          = exports,
    {name: identifier} = require('../../package.json'),
    assert             = require('@nrd/fua.core.assert');

assert(!global[identifier], 'unable to load a second uncached version of the singleton ' + identifier);
Object.defineProperty(global, identifier, {value: DataStore, configurable: false, writable: false, enumerable: false});

const
    _DataStore                            = Object.create(null),
    is                                    = require('@nrd/fua.core.is'),
    strings                               = require('@nrd/fua.core.strings'),
    path                                  = require('path'),
    fs                                    = require('fs/promises'),
    {createReadStream, createWriteStream} = require('fs'),
    async                                 = require('@nrd/fua.core.async'),
    errors                                = require('@nrd/fua.core.errors'),
    rdf                                   = require('@nrd/fua.module.rdf'),
    context                               = require('@nrd/fua.resource.context'),
    persist                               = require('@nrd/fua.module.persistence');

_DataStore.baseUrl     = 'http://localhost/';
_DataStore.dataRoot    = '/var/opt/fua/data';
_DataStore.dataFactory = new persist.DataFactory(context);
_DataStore.contentType = 'text/turtle';
_DataStore.fileEnding  = '.ttl';

_DataStore.accessQueues = Object.create(null);

DataStore.initialize = async function (options = {}) {
    assert.object(options);
    assert(!_DataStore.initialized, 'already initialized');
    _DataStore.initialized = true;

    if (is.string(options.dataRoot)) _DataStore.dataRoot = path.isAbsolute(options.dataRoot) ? options.dataRoot : path.join(process.cwd(), options.dataRoot);
    const dataRootStats = await fs.stat(_DataStore.dataRoot);
    assert(dataRootStats.isDirectory(), 'not a directory');

    if (is.string(options.baseUrl)) _DataStore.baseUrl = options.baseUrl;
    assert(is.string(_DataStore.baseUrl) && strings.web.url.test(_DataStore.baseUrl), 'invalid baseUrl');

    return DataStore;
};

_DataStore.queueAccess = async function (filePath, accessTask) {
    assert.string(filePath);
    assert.function(accessTask);
    const taskQueue = _DataStore.accessQueues[filePath]
        || (_DataStore.accessQueues[filePath] = new async.TaskQueue());
    try {
        return await taskQueue.queue(accessTask);
    } finally {
        if (taskQueue.size === 0) delete _DataStore.accessQueues[filePath];
    }
};

DataStore.getDataset = async function (file) {
    assert(_DataStore.initialized, 'not initialized');
    assert.string(file);
    const filePath = path.join(_DataStore.dataRoot, file.replace(/^\/|\/$/g, '') + _DataStore.fileEnding);
    assert(!path.relative(_DataStore.dataRoot, filePath).startsWith('..'), 'expected filePath to be inside dataRoot');
    return await _DataStore.queueAccess(filePath, async () => {
        await fs.access(filePath);
        const textStream = createReadStream(filePath);
        // textStream.on('error', console.error);
        const quadStream = rdf.parseStream(textStream, _DataStore.contentType, _DataStore.dataFactory, _DataStore.baseUrl);
        // quadStream.on('error', console.error);
        const dataset    = new persist.Dataset(null, _DataStore.dataFactory);
        await dataset.addStream(quadStream);
        return dataset;
    });
};

Object.freeze(DataStore);
module.exports = DataStore;
