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

export = processPath;

declare function processPath(
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
    id: string;
    depth: number;
    fileCount: number;
    dirName: string;
    parent: string | null;
    sizeOfDir: number;
    rollupSize: number;
  }
}
