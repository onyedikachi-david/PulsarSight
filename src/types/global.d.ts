/// <reference types="node" />

declare global {
  interface Window {
    Buffer: typeof import('buffer').Buffer;
    process: NodeJS.Process;
    global: Window;
    Stream: typeof import('stream').Stream;
  }
}
