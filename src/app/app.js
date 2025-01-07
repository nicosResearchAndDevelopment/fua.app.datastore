const
    assert = require('@fua/core.assert'),
    is     = require('@fua/core.is'),
    tty    = require('@fua/core.tty'),
    rdf    = require('@fua/module.rdf'),
    errors = require('@fua/core.errors');

module.exports = async function ({server: {app, io}, datastore, ...config}) {

    app.enable('strict routing');
    app.enable('case sensitive routing');

    app.use(function (request, response, next) {
        tty.log.request(request);
        next();
    });

    app.get('*', async function (request, response) {
        try {
            // if (request.url === '/') throw new errors.http.RequestError(404, request);
            const contentType = request.accepts(rdf.contentTypes);
            if (!contentType) throw new errors.http.RequestError(406, request);
            const dataset = await datastore.getDataset(request.url);
            const result  = await rdf.serializeDataset(dataset, contentType);
            response.type(contentType).send(result);
        } catch (err) {
            console.error(err);
            response.sendStatus(err.code === 'ENOENT' && 404 || err.status || 500);
        }
    });

};
