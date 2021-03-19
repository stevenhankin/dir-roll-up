import { createHash } from "crypto";
import { readdirSync, statSync } from "fs";
import { sep } from "path";

/**
 * Based on a core FS Stat
 * but also includes the file/dir name
 */
type FileStat = {
  name: string;
  stat: {
    isDirectory: boolean;
    isFile: boolean;
    isSymbolicLink: boolean;
    size: number;
  };
};

/**
 * Can't use recursion with the generator
 * so we have homegrown recursion using a stack
 */
type Stack = { path: string; thisNode: DirNode; childDirs: FileStat[] };

/**
 * Used for md5 hashing a directory name to
 * create a compact attribute for fast look-up
 * @param txt
 * @returns hash in hex format
 */
const encode = (txt: string): string =>
  createHash("md5").update(txt).digest("hex");

/**
 * Take a path string of directories
 * separated by path separators
 * and return the final dir
 * e.g. /a/b/c/d => d
 */
const thisDirName = (path: string) => path.split(sep).slice(-1)[0];

/**
 * Used for filtering out unwanted File Stats that are marked as undefined
 */
function isFileStat<FileStat>(value: FileStat | undefined): value is FileStat {
  return value !== undefined;
}

/**
 * Metadata for a directory
 */
export type DirNode = {
  id: string /* Hash of the full path */;
  depth: number /* Directory depth from root */;
  fileCount: number /* Not including descendents */;
  dirName: string;
  parent:
    | string
    | undefined /* Hash of parent path (undefined if this is the root) */;
  sizeOfDir: number /* Size of all files in directory */;
  rollupSize: number /* Size of files in current and descendent directories */;
};

/**
 * Generator for yielding directory metadata nodes
 * @param path Starting file path for checking space usage
 * @returns generator for
 */
module.exports = async function* processPath(path: string) {
  const stack: Stack[] = [];
  let depth = 0;
  let thisNode: DirNode | undefined;
  let childDirs: FileStat[] | undefined;

  while (true) {
    // Convert dir name to a hash
    const id = encode(path);
    // and the parent dir (so we can keep a pointer to it for roll-up of space)
    let parentPath: string | undefined = path.substr(0, path.lastIndexOf(sep));
    if (parentPath.length === 0) {
      parentPath = undefined;
    }
    // and also its hash
    const parentPathHash = parentPath && encode(parentPath);

    const dirName = thisDirName(path);

    if (thisNode === undefined || childDirs === undefined) {
      const files = readdirSync(path, {});

      /**
       * Get all the stats of the files
       * but also inject the file/dir names
       * which are needed
       */
      const stats: FileStat[] = (
        await Promise.all(
          files.map(async (f: string | Buffer) => {
            try {
              const s = statSync(path + sep + f);
              return {
                name: f.toString(),
                stat: {
                  isDirectory: s.isDirectory(),
                  isFile: s.isFile(),
                  isSymbolicLink: s.isSymbolicLink(),
                  size: s.size,
                },
              };
            } catch (e) {
              // Remove symbolic links to non-existent files
              return undefined;
            }
          })
        )
      ).filter(isFileStat);

      childDirs = stats.filter((s) => s.stat.isDirectory);
      const filesInThisDir = stats.filter(
        (s) => s.stat.isFile && !s.stat.isSymbolicLink
      );
      // Get sizes of all files in current directory
      const thisDirSize = filesInThisDir.reduce((a, b) => a + b.stat.size, 0);

      thisNode = {
        id,
        depth,
        fileCount: filesInThisDir.length,
        sizeOfDir: thisDirSize,
        rollupSize: thisDirSize,
        dirName,
        parent: parentPathHash,
      };
    }

    try {
      if (childDirs.length === 0) {
        /**
         * No child directories, so we yield the current node
         * and head back up to the previous level
         */
        const parent = stack.pop();
        if (parent !== undefined) {
          yield thisNode;
          depth--;
          const sizeOfChild = thisNode.rollupSize;
          path = parent.path;
          thisNode = parent.thisNode;
          thisNode.rollupSize += sizeOfChild;
          childDirs = parent.childDirs;
        } else {
          // Finished
          return thisNode;
        }
      } else {
        if (thisNode) {
          const firstChildDir = childDirs.pop();
          if (firstChildDir) {
            stack.push({ path, thisNode, childDirs });
            path = path + sep + firstChildDir.name;
            depth++;
            thisNode = undefined;
            childDirs = undefined;
          }
        } else {
          throw new Error(
            "Unexpected error: Child directories but current node is undefined"
          );
        }
      }
    } catch (e) {
      console.error("Failed", e);
      throw e;
    }
  }
};
