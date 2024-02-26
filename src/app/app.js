const
    assert = require('@nrd/fua.core.assert'),
    is     = require('@nrd/fua.core.is'),
    tty    = require('@nrd/fua.core.tty');

module.exports = async function ({server: {app, io}, ...config}) {

    app.use(function (request, response, next) {
        tty.log.request(request);
        next();
    });

    app.get('/', function (request, response) {
        response.type('text').send('Hello World!');
    });

    app.get('/about', function (request, response) {
        response.type('json').send(JSON.stringify({
            issuer: `${request.protocol}://${request.host}/`
        }));
    });

};
