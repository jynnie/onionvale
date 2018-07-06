# onionvale

a simple collaborative text-based adventure platform designed for play be 2E

for any feature requests or bug reports, [open issues](https://github.com/jynnie/onionvale/issues) for this repo

for a comprehensive documentation on how I designed/developed this application, check out 
[documentation.md](https://github.com/jynnie/onionvale/blob/master/documentation.md)

## Design Considerations

onionvale is designed for play by 2E, a small community of friends. as such, this implementation 
stresses less on enforcing community rules (such as not allowing replies to one's own message 
or timeouts before another message). instead, i've tried to create much more of an open platform 
for the community to iterate, be creative, and follow an honor system. this system, of course, 
is much less viable when the community grows much larger. i have, however, prevented javascript 
and html injection, but with certain exceptions

## Development

1. install [Node.js](https://nodejs.org/en/download/) and [MongoDB](https://www.mongodb.com/download-center#community)
2. `npm install` dependencies
3. `cp example.config.js config.js`
4. set the appropraite environment variables in `config.js`
4. `mkdir db`
4. `mongod --dbpath db & # Have the mongo daemon run in the background`
4. `npm start` to run local instance on `localhost:8080`
