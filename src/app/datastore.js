const
    DataStore          = exports,
    {name: identifier} = require('../../package.json'),
    assert             = require('@fua/core.assert');

assert(!global[identifier], 'unable to load a second uncached version of the singleton ' + identifier);
Object.defineProperty(global, identifier, {value: DataStore, configurable: false, writable: false, enumerable: false});

const
    _DataStore                            = Object.create(null),
    is                                    = require('@fua/core.is'),
    strings                               = require('@fua/core.strings'),
    path                                  = require('path'),
    fs                                    = require('fs/promises'),
    {createReadStream, createWriteStream} = require('fs'),
    async                                 = require('@fua/core.async'),
    errors                                = require('@fua/core.errors'),
    rdf                                   = require('@fua/module.rdf'),
    context                               = require('@fua/resource.context'),
    persist                               = require('@fua/module.persistence');

_DataStore.baseURI     = 'http://localhost/';
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

    if (is.string(options.baseURI)) _DataStore.baseURI = options.baseURI;
    assert(is.string(_DataStore.baseURI) && strings.web.url.test(_DataStore.baseURI), 'invalid baseURI');

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

_DataStore.extractBaseURI = function (urlPath) {
    const url = new URL(urlPath, _DataStore.baseURI);
    return url.protocol + '//' + url.hostname
        + (url.pathname.endsWith('/index') ? url.pathname.slice(0, -5) : url.pathname)
        + (url.pathname.endsWith('/') ? '' : '#');
};

_DataStore.extractPath = function (urlPath) {
    const url = new URL(urlPath, _DataStore.baseURI);
    return path.join(_DataStore.dataRoot, url.pathname + (url.pathname.endsWith('/') ? 'index' : '') + _DataStore.fileEnding);
};

DataStore.getDataset = async function (urlPath) {
    assert(_DataStore.initialized, 'not initialized');
    assert.string(urlPath, strings.web.url.path.pattern);
    const filePath = _DataStore.extractPath(urlPath);
    assert(!path.relative(_DataStore.dataRoot, filePath).startsWith('..'), 'expected filePath to be inside dataRoot');
    const baseURI = _DataStore.extractBaseURI(urlPath);
    return await _DataStore.queueAccess(filePath, async () => {
        await fs.access(filePath);
        const quadStream = rdf.parseStream(createReadStream(filePath), _DataStore.contentType, _DataStore.dataFactory, baseURI);
        const dataset    = new persist.Dataset(null, _DataStore.dataFactory);
        await dataset.addStream(quadStream);
        return dataset;
    });
};

Object.freeze(DataStore);
module.exports = DataStore;
