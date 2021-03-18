import { createHash } from "crypto";
import { readdir } from "fs";
import { stat } from "fs/promises";
import { sep } from "path";

/**
 * Used for md5 hashing a directory name to
 * create a compact attribute for fast look-up
 * @param txt
 * @returns hash in hex format
 */
const encode = (txt: string): string =>
  createHash("md5").update(txt).digest("hex");

type TreeNode = {
  depth: number /* Directory depth from root */;
  fileCount: number;
  dirName: string;
  parentPathHash: string | undefined;
  sizeOfDir: number /* Size of all files in directory */;
  totalSize: number /* Size of files in current and descendent directories */;
};

type TreeModel = {
  [key: string]: TreeNode;
};

const treeModel: TreeModel = {};

/**
 * For the supplied file size,
 * add it to the current directory total
 * and all parent directory totals
 * @param treeDataObj
 * @param size
 * @param number
 */
const applyRollupSize = (treeDataObj: TreeNode, size: number): void => {
  treeDataObj.totalSize += size;
  const parentDirHash = treeDataObj.parentPathHash;
  if (parentDirHash) {
    const parentNode = treeModel[parentDirHash];
    applyRollupSize(parentNode, size);
  }
};

/**
 * Take a path string of directories
 * separated by path separators
 * and return the final dir
 * e.g. /a/b/c/d => d
 */
const thisDirName = (path: string) => path.split(sep).slice(-1)[0];

/**
 *
 * @param path
 * @param depth
 * @returns
 */
const processDir = (path: string, depth: number = 0) => {
  return new Promise<void>((resolve, reject) => {
    try {
      // Convert dir name to a hash
      const dirHash = encode(path);
      // and the parent dir (so we can keep a pointer to it for roll-up of space)
      let parentPath: string | undefined = path.substr(
        0,
        path.lastIndexOf(sep)
      );
      if (parentPath.length === 0) {
        parentPath = undefined;
      }
      // and also its hash
      const parentPathHash = parentPath && encode(parentPath);
      // if it's the top dir level it may not exist
      if (
        parentPath &&
        parentPathHash &&
        treeModel[parentPathHash] === undefined
      ) {
        treeModel[parentPathHash] = {
          depth,
          fileCount: 0,
          sizeOfDir: 0,
          totalSize: 0,
          dirName: thisDirName(parentPath),
          parentPathHash: encode(
            parentPath.substr(0, parentPath.lastIndexOf(sep))
          ),
        };
      }
      // and see if it is already in out tree model
      let treeDataObj = treeModel[dirHash];
      if (treeDataObj === undefined) {
        // if not, we intialise to a default
        treeDataObj = {
          depth,
          fileCount: 1,
          sizeOfDir: 0,
          totalSize: 0,
          dirName: thisDirName(path),
          parentPathHash: parentPathHash,
        };
        treeModel[dirHash] = treeDataObj;
      }

      readdir(path, {}, async (err, files) => {
        if (err) {
          throw err;
        }
        await Promise.allSettled(
          files.map(async (f: string | Buffer) => {
            const fullPath = path + sep + f;
            try {
              const stats = await stat(fullPath);
              if (stats.isDirectory()) {
                const childDir = path + sep + f;
                return processDir(childDir, depth + 1);
              } else if (stats.isFile()) {
                treeDataObj.fileCount++;
                treeDataObj.sizeOfDir += stats.size;
                applyRollupSize(treeDataObj, stats.size);
              }
            } catch (reason) {
              console.error(reason);
            }
          })
        );
        return resolve();
      });
    } catch (e) {
      console.error(`Failed processing ${path}`);
    }
  });
};

processDir(".").then(() => console.log(treeModel));
