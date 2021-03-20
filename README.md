# dir-roll-up

Module to get space usage for all sub directories in a path.

### [Try on RunKit](https://runkit.com/stevenhankin/dir-roll-up-example)

---

Implemented as an asynchronous generator that only uses core modules:

- Responsive and non-blocking
- Lower runtime memory usage

![Usage](https://raw.githubusercontent.com/stevenhankin/dir-roll-up/main/info/dir-roll-up.gif)

## Installing

```
npm install dir-roll-up
```

## Nodes

Each directory is returned as a node in the following format:

```json
{
  "id": "8abf23ea00bbf8ac2ff47b6ecba9984f",
  "depth": 1,
  "fileCount": 5,
  "sizeOfDir": 2032,
  "rollupSize": 259737,
  "dirName": ".git",
  "parent": "5058f1af8388633f609cadb75a75dc9d"
}
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
