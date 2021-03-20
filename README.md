# dir-roll-up

Module to get space usage for all sub directories in a path.

Implemented as an asynchronous generator that only uses core modules:

- Responsive and non-blocking
- Lower runtime memory usage

![Usage](https://raw.githubusercontent.com/stevenhankin/dir-roll-up/main/info/dir-roll-up.gif)

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

### Get each directory node, as required (in an interval loop)

```
const processPath = require("dir-roll-up");

const dirNodeGenerator = processPath(".");

const interval = setInterval(async () => {

  /**
   * Get the next directory...
   */
  const dirNode = await dirNodeGenerator.next();

  /**
   * ..display it..
   */
  console.log(dirNode.value);

  /**
   * ..and end the interval when last directory retrieved (which will be the root)
   */
  if (dirNode.done) {
    console.log("Finished!");
    clearInterval(interval);
  }
}, 300);
```
