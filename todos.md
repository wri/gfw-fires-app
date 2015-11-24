Fires TODOS:
---
- update project devops
	- heroku build off src
	- www separation
		- move .htaccess to www
	- update procfile
- separate pages
	- separate global & unique stylesheets
	- separate js to execute per page
	√ get rid of partials/templates, each static page should inherit from one template
	√ use index.html and folders, pages shouldn't end in extensions
	√ create inlt18 folders with english & indonesian config texts
- build processing
	√ have master locals file that renders pages with appropriate locals
	√ update dependencies to bower
	√ update to es6?
	√ eslint
	√ gulp
	- integrated versioning
	- integrated cache busting
- SEO
	- should handle on the template level and take locals to configure per page
	√ render site as /en/ and /id/ language versions
		- get translations for text strings
- styling
	- add normalize
	- mobile friendly design
	- update control panel to gfw water design, combining layer controls & legend
