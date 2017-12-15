import { TokenType } from './token-types';

export class Token {
  private tokenType: TokenType;
  private lexeme: string;
  private literal: any;
  private line: number;

  constructor(tokenType: TokenType, lexeme: string, literal: any, line: number){
    this.tokenType = tokenType;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;

    this.toString = this.toString.bind(this);
  }

  public toString() {
    return `${this.tokenType} ${this.lexeme} ${this.literal}`;
  }
}