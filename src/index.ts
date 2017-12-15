import * as fs from 'fs';
import * as process from 'process';
import * as readline from 'readline';
import { Observable } from 'rxjs';
import { argv } from 'yargs';
import { Scanner } from './scanner';

let hadError = false;

export const error:  (l: number, m: string) => void = (line, message) => {
  report(line, '', message);
}

const report: (
  l: number, w: string, m: string, 
) => void = (line, where, message) => {
  console.log(`[line ${line}] Error ${where}: ${message}`);
  hadError = true;
};

const runFile: (f: string) => void = filename => {
  fs.readFile(filename, 'utf-8', (err, data) => {
    if(err) {
      console.error('there was an error opening file');
      console.log(err.message);
      process.exit(1);
    }
    run(data);
  });

  // exit with error if there was an error
  if(hadError) { process.exit(65); }
}


const runPrompt = () => {

  const observable = Observable.create(async observer => {
    while(true) {
      const rl1 = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
      });

      await new Promise(resolve => {
        rl1.question('> ', line => {
          observer.next(line);
          rl1.close();
          resolve();
        })
      });
    }
  });
  return observable;
}


const run: (i: string) => void = input => {
  // const tokens: string[] = input.split(' ');
  // for(const token of tokens) {
  //   console.log(token);
  // }
  const scanner = new Scanner(input);
  scanner.scanTokens();
  const tokens = scanner.tokens;
  console.log(tokens);
}





if(argv._.length > 1) {
  console.log('usage: jslox [script]');
  process.exit(0);
}

if(argv._.length === 1) {
  const filename = argv._[0];
  runFile(filename);
  process.exit(0);
}


const prompt = runPrompt();
prompt.subscribe({ 
  next: s => {
    run(s);
    hadError = false;
  }
});

