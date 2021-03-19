# dir-roll-up

Module to get space usage for all sub directories in a path.

Implemented as an asynchronous generator that only uses core modules:

- Responsive and non-blocking
- Lower runtime memory usage

## Installing

```
npm install dir-roll-up
```

## Examples

### List all directories under current location

```
var dirRollUp = require("dir-roll-up");

(async () => {
  for await (let dirNode of dirRollUp(".")) {
    console.log(dirNode);
  }
})();
```
