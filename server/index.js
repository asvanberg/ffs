var path = require('path'),
    express = require('express'),
    app = express(),
    pubDir = path.join(__dirname, '..', 'client')
    browserify = require('browserify-middleware')

app.get('/app.js', browserify(path.join(pubDir, 'js', 'app.js')))

app.get('/*', function(request, response) {
  response.sendFile(path.join(pubDir, 'index.html'))
});

if (require.main === module) {
  var port = process.env.PORT || 5000;
  app.listen(port);
  console.log('Listening on http://localhost:' + port);
}

module.exports = app;
