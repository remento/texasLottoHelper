/*jslint node:true */
(function () {
    'use strict';
    var server,
        express = require('express'),
        app = express();

    app.use(express['static']('dist'));

    server = app.listen(3000, function () {
        var host = server.address().address,
            port = server.address().port;
        console.log('Example app listening at http://%s:%s', host, port);
    });
}());


