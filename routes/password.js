/*
* Router for displaying password pages. 
*
* Given a URL that ends in /password/id, consults table at 
* data/password_pages.txt and searches for id. 
* If info is found in the table instantiates template at 
* views/password.ejs.
*
* Also checks user IP to make sure it exists in data/ip_whitelist.txt.
*/

const express = require('express'),
      router = express.Router(),
      fs = require('fs');

// Middleware to restrict IPs.
const data = fs.readFileSync('data/ip_whitelist.txt', 'utf-8');
const whitelist = data.split('\n')
  .map(line => line.trim())
  .filter(line => line && line.substring(0,1) != '#');
console.log(whitelist);
router.get('/password/*', function(req, res, next) {
  var ip = req.ip || 
          req.headers['x-forwarded-for'] || 
          req.connection.remoteAddress || 
          req.socket.remoteAddress ||
          req.connection.socket.remoteAddress;
  console.log("Checking for IP " + ip);
  if (whitelist.includes(ip)) {
    console.log("IP found.");
    next();
  } else {
    // TODO: create "no access" page w. ezproxy link
    res.end();
  }
});

router.get('/password/:id', function(req, res, next) {
  // Read in tab-delimited text
  fs.readFile('data/password_pages.txt', 'utf-8', function(err, data) {
    if (err) {
      throw err;
    }
    processLines(data);
  });

  function processLines(data) {
    // Search for journal.
    // See data/password_pages.txt for field definitions.
    var lines = data.split('\n');
    lines.shift(); // remove header
    var found = false;
    var fields;
    for(var i = 0; i < lines.length && !found; i++) {
      fields = lines[i].split('\t');
      if (fields[1] === req.params.id) {
        found = true;
      }
    }

    if(found) {
      // Pull out info and pass to template.
      const display = {
        title : fields[0],
        username : fields[2],
        password : fields[3],
        url : fields[4],
        note : fields[5]
      }
      res.render('password', {display: display});
    } else {
      res.render('resource_missing', {id: req.params.id});
    }
  }
});

module.exports = router;