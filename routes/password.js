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