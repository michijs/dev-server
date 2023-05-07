import { fileURLToPath } from 'url';
import { Worker } from 'worker_threads';
import ts from 'typescript';
import { dirname } from 'path';
import { getPath } from './getPath.js';

function runInThread<T extends (...args: any) => any>(
  args: Parameters<T>,
): Promise<ReturnType<T>> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      getPath(
        `${dirname(fileURLToPath(import.meta.url))}/transpileFileInThread`,
      ),
    );

    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });

    worker.postMessage(args);
  });
}

export async function transpileFilesWithThreads(
  filePaths: string[],
  compilerOptions: ts.CompilerOptions,
): Promise<string[]> {
  const resultPromises = filePaths.map((inputFilePath) => {
    return runInThread([inputFilePath, compilerOptions]);
  });

  const results = await Promise.all(resultPromises);

  console.log(results);

  return results;
}
