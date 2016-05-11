'use strict';

var path = require('path'),
    express = require('express'),
    app = express(),
    pubDir = path.join(__dirname, '..', 'client'),
    browserify = require('browserify-middleware'),
    babelify = require('babelify');

app.use('/app.js', browserify(path.join(pubDir, 'js', 'app.js'), {
  transform: [babelify.configure({
    presets: ['es2015']
  })]
}))

app.use(express.static(path.join(pubDir, 'static')));

if (require.main === module) {
  var port = process.env.PORT || 5000;
  app.listen(port);
  console.log('Listening on http://localhost:' + port);
}

module.exports = app;
