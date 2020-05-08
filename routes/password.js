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

// Field definitions for columns in data spreadsheet.
const fieldDefs = {
  title: 0,
  id: 1,
  username: 2,
  password: 3,
  customName: 4,
  customValue: 5,
  url: 6,
  publicNote: 7,
  privateNote: 8
}

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
    var display = { accounts: [], customFields: [] };
    for(var i = 0; i < lines.length; i++) {
      const fields = lines[i].split('\t');
      if (fields[1] === req.params.id) {
        // Check for presence of singly-defined fields (title, URL, note).
        // Only store the first value found.
        if(!display.hasOwnProperty('title') && 
          fields[fieldDefs.title].length > 0) {
          display.title = fields[fieldDefs.title];
        }
        if(!display.hasOwnProperty('url') && fields[fieldDefs.url].length > 0) {
          display.url = fields[fieldDefs.url];
        }
        if(!display.hasOwnProperty('note') && 
          fields[fieldDefs.publicNote].length > 0) {
          display.note = fields[fieldDefs.publicNote];
        }
        // For account data and custom fields, store repeated values.
        if(fields[fieldDefs.username].length > 0) {
          display.accounts.push({username: fields[fieldDefs.username], 
            password: fields[fieldDefs.password]});
        }
        if(fields[fieldDefs.customName].length > 0) {
          display.customFields.push({name: fields[fieldDefs.customName], 
            value: fields[fieldDefs.customValue]});
        }
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