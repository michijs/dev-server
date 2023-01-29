import { tsconfig } from '../config/tsconfig';
import { config } from '../config/config';
import { exec } from 'child_process';
import fs from 'fs';
import glob from 'glob'
// import { transform } from 'esbuild';
// import ts from 'typescript'

// function compile(fileNames: string[]): void {
//   const options = {
//     ...tsconfig.compilerOptions,
//     emitDeclarationOnly: true
//   }
//   const program = ts.createProgram(fileNames, options);
//   program.getSourceFiles.forEach(file => {
//     program.emit(file, (fileName, text) => console.log({fileName, text}), );
//   })
//   // // Create a Program with an in-memory emit
//   // const createdFiles = {}
//   // const host = ts.createCompilerHost(options);
//   // host.writeFile = (fileName: string, contents: string) => createdFiles[fileName] = contents
  
//   // // Prepare and emit the d.ts files
//   // const program = ts.createProgram(fileNames, options, host);
//   // program.emit();

//   // // Loop through all the input files
//   // fileNames.forEach(file => {
//   //   console.log("### JavaScript\n")
//   //   console.log(host.readFile(file))

//   //   console.log("### Type Definition\n")
//   //   const dts = file.replace(".js", ".d.ts")
//   //   console.log(createdFiles[dts])
//   // })
// }

export function dist(callback: () => void, watch = false) {
  if(tsconfig.compilerOptions.outDir)
  if (fs.existsSync(tsconfig.compilerOptions.outDir)) {
    fs.rmSync(tsconfig.compilerOptions.outDir, { recursive: true });
  }

  const extensions = ['.ts', '.ts', '.d.ts']

  if (tsconfig.compilerOptions.allowJs)
    extensions.push('.js', '.jsx')

  // TODO: validate include
  const files = tsconfig.include.reduce((previousValue, currentValue) => {
    const result = glob.sync(currentValue.includes('*') ? currentValue : `${currentValue}/**/*[${extensions.join(',')}]`, { ignore: tsconfig.exclude, nodir: true })
    return previousValue.concat(...result);
  }, [] as string[])

  // esbuild still not supports .d.ts files
  files.map(x => { 
    // transform(fs.readFileSync(x, 'utf-8'), {
    //   tsconfigRaw: 

    // })
  })

  callback()

  // exec(`tsc ${watch ? '-w' : ''} --emitDeclarationOnly --project ${config.esbuildOptions.tsconfig}`, callback);
}