#!/usr/bin/env node

const
    path      = require('path'),
    App       = require('@nrd/fua.agent.app'),
    DataStore = require('./app/datastore.js');

App.launch({
    app: require('./app/app.js'),
    async initialize(config) {
        await DataStore?.initialize?.(config.datastore);
        return {datastore: DataStore};
    },
    space:  {
        context: {},
        store:   {
            module:  'filesystem',
            options: {
                defaultFile: 'file://data.ttl',
                loadFiles:   [
                    {
                        'dct:identifier': path.join(__dirname, '../data/load.json'),
                        'dct:format':     'application/fua.load+json'
                    },
                    require('@nrd/fua.resource.ontology.core')
                ]
            }
        }
    },
    domain: {
        uri: 'https://data.tb.nicos-rd.com/domain/'
    },
    helmut: true,
    amec:   {
        mechanisms: [
            {authType: 'BasicAuth', usernameAttr: 'dom:name', passwordAttr: 'dom:password'}
        ]
    },
    server: {
        port:    3000,
        app:     true,
        io:      true,
        session: {
            secret:            '@nrd/fua.app.datastore',
            resave:            false,
            saveUninitialized: false
        }
    }
});
