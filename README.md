# Local Electronic Resources Pages
written by: Mitchell Manar (mitchell.manar@northwestern.edu).

Node/Express.js app to create simple pages for local electronic resources kept on Gimli 2.0.

Currently under development. If you would like to test it, it should (_should_) run with a simple "npm install; npm start". Assuming you have node installed on your machine and everything else goes well, it will come up at localhost:3000.  

# Content
To upload the content of the pages, update the files in the folder data/. Please export the data from Excel as tab-delimited text. A more detailed guide is forthcoming.

# Directory Strcuture
- bin: boot script. To be removed.
- data: holds CSV information about local electronic resources.
- public: shared image and CSS resources.
- routes: js handlers for each page type.
- views: Templates for page creation. Uses EJS, documented at ejs.co.
