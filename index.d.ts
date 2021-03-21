// Type definitions for dir-roll-up
// Definitions by: Steve Hankin <https://github.com/stevenhankin>

// Note that ES6 modules cannot directly export class objects.
// This file should be imported using the CommonJS-style:
//   import x = require('[~THE MODULE~]');
//
// Alternatively, if --allowSyntheticDefaultImports or
// --esModuleInterop is turned on, this file can also be
// imported as a default import:
//   import x from '[~THE MODULE~]';
//
// Refer to the TypeScript documentation at
// https://www.typescriptlang.org/docs/handbook/modules.html#export--and-import--require
// to understand common workarounds for this limitation of ES6 modules.

export as namespace dirRollUp;

export = dirRollUp;

declare function dirRollUp(
  path: string,
  options?: dirRollUp.Options
): AsyncGenerator<dirRollUp.DirNode, dirRollUp.DirNode, unknown>;

declare namespace dirRollUp {
  /**
   * Processing options
   */
  export type Options = {
    includePartial: boolean;
  };
  /**
   * Metadata for a directory
   */
  export interface DirNode {
    id: string /* Unique identifier for a node */;
    depth: number /* Distance from top node */;
    fileCount: number /* Number of files in directory */;
    dirName: string /* Name */;
    parent: string | null /* Id of parent node */;
    sizeOfDir: number /* Size in bytes of files in directory */;
    rollupSize: number /* Total size of all files contained including subdirectories */;
  }
}
