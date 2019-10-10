test:
	npm test -s

start:
	npm run nodemon -- --exec babel-node bin/app.js

start2:
	nodemon --exec babel-node -- bin/app.js

