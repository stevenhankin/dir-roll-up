import processPath from "..";

test("rollup the single-level source directory", async () => {
  const x = processPath("src");
  const response = await x.next();
  const dirNode = response.value;
  expect(dirNode.dirName).toBe("src");
  expect(dirNode.depth).toBe(0);
  expect(dirNode.parent).toBe(null);
  expect(response.done).toBe(true);
});

test("rollup the deeper node_modules", async () => {
  const x = processPath("node_modules");
  const response = await x.next();
  const dirNode = response.value;
  expect(dirNode.dirName).toBe("node_modules");
  expect(dirNode.depth).toBe(0);
  expect(dirNode.parent).toBe(null);
  expect(response.done).toBe(false);
});
