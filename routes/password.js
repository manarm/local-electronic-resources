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
    var display = { accounts: [] };
    for(var i = 0; i < lines.length; i++) {
      const fields = lines[i].split('\t');
      if (fields[1] === req.params.id) {
        // Check for presence of singly-defined fields (title, URL, note).
        // Only store the first value found.
        if(!display.hasOwnProperty('title') && fields[0].length > 0) {
          display.title = fields[0];
        }
        if(!display.hasOwnProperty('url') && fields[4].length > 0) {
          display.url = fields[4];
        }
        if(!display.hasOwnProperty('note') && fields[5].length > 0) {
          display.note = fields[5];
        }
        // Store username/password combos (may be multiple)
        display.accounts.push({username: fields[2], password: fields[3]});
      }
    }

    if(display.hasOwnProperty('url')) {
      res.render('password', {display: display});
    } else {
      res.render('resource_missing', {id: req.params.id});
    }
  }
});

module.exports = router;