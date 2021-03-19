# dir-roll-up

## Examples

### List all directories under current location

```
(async () => {
  for await (let dirNode of processDir(".")) {
    console.log(dirNode);
  }
})();
```
