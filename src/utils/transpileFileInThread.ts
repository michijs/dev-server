import worker_threads from 'worker_threads';
import ts from 'typescript';

function transpileFile(
  inputFilePath: string,
  compilerOptions: ts.CompilerOptions,
) {
  compilerOptions.incremental = false;
  const program = ts.createProgram([inputFilePath], compilerOptions);
  const emitResult = program.emit();
  const allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);
  if (allDiagnostics.length > 0) {
    throw allDiagnostics[0].messageText;
  }
}

worker_threads.parentPort?.once(
  'message',
  (message: Parameters<typeof transpileFile>) => {
    const result = transpileFile(...message);
    worker_threads.parentPort?.postMessage(result);
  },
);
