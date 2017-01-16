// Dev web server - only static hosting file hosting is used

/*jslint node:true */
(function () {
    'use strict';
    var server,
        express = require('express'),
        app = express();

    // serve static files
    app.use('/index.html', express.static('./index.html'));
    app.use('/dist', express.static('dist'));

    server = app.listen(3000, function () {
        var host = server.address().address,
            port = server.address().port;
        console.log('Example app listening at http://%s:%s', host, port);
    });
}());


