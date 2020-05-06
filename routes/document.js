/*
* Router for displaying document pages. 
*
* Given a URL that ends in /document/id, consults table at 
* data/document_pages.txt and searches for id. 
* If info is found in the table, it will issue a GET request for the resource's
* HTML and instantiate the template at views/document.ejs
*/

const express = require('express'),
      router = express.Router(),
      https = require('https');

router.get('/document/:id', function(req, res, next) {  
  // Read in tab-delimited text
  fs.readFile('data/document_pages.txt', 'utf-8', function(err, data) {
    if (err) {
      throw err;
    }
    processLines(data);
  });

  function processLines(data) {
    // Search for journal.
    // See data/document_pages.txt for field definitions.
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
      // Pull out title info to pass to template.
      const display = {
        title : fields[0],
        style : fields[2], // csv or html
        path : fields[3],
        note : fields[4]
      }

      // Fetch document-specific HTML to insert into page.
      const options = {
        hostname: 'files.library.northwestern.edu',
        port: 443,
        path: display.path,
        method: 'GET'
      };
      let output = '';
      const req = https.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`)
        res.setEncoding('utf8');
        res.on('data', chunk => {
          output += chunk;
        })
        res.on('end', () => {
          display.data = output;
          renderPage(display);
        })
      })
      req.on('error', error => {
        // TODO: error handling here. Different page/message?
        console.error(error)
      })
      req.end();
    } else { // resource not found
      res.render('resource_missing', {id: req.params.id});
    }
  }

  function renderPage(display) {
    if(display.style === 'html') {
      console.log("HTML style; rendering with inserted page...");
      res.render('document', {display: display});
    } else if (display.style === 'csv') {
      console.log("CSV style: Not implemented.");
    } else {
      console.log("WARNING: unrecognized style.");
    }
  }
});

module.exports = router;
