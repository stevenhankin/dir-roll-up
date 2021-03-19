# dir-roll-up

Node module that iterates over all subdirectories under a path, yielding a total space usage at each level.

Implemented as an asynchronous generator that only uses core modules.

## Installing

```
npm install dir-roll-up
```

## Examples

### List all directories under current location

```
const processPath = require("dir-roll-up");

(async () => {
  for await (let dirNode of processPath(".")) {
    console.log(dirNode);
  }
})();
```
