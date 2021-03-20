// eslint-disable-next-line @typescript-eslint/no-var-requires
const processPath = require(".");

/**
 * Helper
 * @returns number of times the root node (depth 0) has been emitted
 */
const howOftenRootEmitted = async (options = {}) => {
  let rootCount = 0;
  for await (const dirNode of processPath("node_modules", options)) {
    if (dirNode.depth === 0) {
      rootCount++;
    }
  }
  return rootCount;
};

test("rollup the single-level source directory", async () => {
  // Arrange
  const x = processPath("src");
  // Act
  const response = await x.next();
  const { done } = await x.next();
  // Assert
  const dirNode = response.value;
  expect(dirNode.dirName).toBe("src");
  expect(dirNode.depth).toBe(0);
  expect(dirNode.parent).toBe(null);
  expect(done).toBe(true);
});

test("rollup the deeper node_modules", async () => {
  // Arrange
  const x = processPath("node_modules");
  // Act
  let response = await x.next();
  let dirNode = response.value;
  while (!response.done && dirNode.depth !== 0) {
    response = await x.next();
    dirNode = response.value;
  }
  // Assert
  expect(dirNode.dirName).toBe("node_modules");
  expect(dirNode.depth).toBe(0);
  expect(dirNode.parent).toBe(null);
});

test("with no options, should only yield root node once", async () => {
  const rootCount = await howOftenRootEmitted();
  expect(rootCount).toBe(1);
});

test("using includePartial option should yield root node at multiple times", async () => {
  const rootCount = await howOftenRootEmitted({
    includePartial: true,
  });
  expect(rootCount).toBeGreaterThan(1);
});
