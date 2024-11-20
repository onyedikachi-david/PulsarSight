import { Buffer } from 'buffer/';
import process from 'process';
import { Stream } from 'stream-browserify';

if (typeof window !== 'undefined') {
  // Add Buffer to window
  window.Buffer = window.Buffer || Buffer;

  // Add process to window
  window.process = process;

  // Add global
  window.global = window;

  // Add Stream
  window.Stream = Stream;

  // Add process.version for packages that depend on it
  process.version = process.version || 'v16.0.0';
}
