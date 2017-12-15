import { error } from './index';
import { Token } from './token';
import { Keywords, TokenType } from './token-types';
import { sep } from 'path';

export class Scanner {

  private source: string;
  public tokens: Token[] = [];
  private start: number  = 0;
  private current: number = 0;
  private line: number = 1;

  constructor(source: string) {
    this.source = source;

    this.addToken = this.addToken.bind(this);
    this.advance = this.advance.bind(this);
    this.isAlpha = this.isAlpha.bind(this);
    this.isAlphaNumeric = this.isAlphaNumeric.bind(this);
    this.isAtEnd = this.isAtEnd.bind(this);
    this.isDigit = this.isDigit.bind(this);
    this.identifier = this.identifier.bind(this);
    this.match = this.match.bind(this);
    this.number = this.number.bind(this);
    this.peek = this.peek.bind(this);
    this.peekNext = this.peekNext.bind(this);
    this.scanToken = this.scanToken.bind(this);
    this.scanTokens = this.scanTokens.bind(this);
    this.string = this.string.bind(this);
  }


  private addToken(tokenType: TokenType, literal: any = null) {
    const text: string = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(tokenType, text, literal, this.line));
  }

  
  private advance() {
    this.current = this.current + 1;
    return this.source.charAt(this.current - 1);
  }


  private isAlpha(c: string) {
    return (c >= 'a' && c <= 'z') ||
           (c >= 'A' && c <= 'Z') ||
            c == '_';
  }


  private isAlphaNumeric(c: string) {
    return this.isAlpha(c) || this.isDigit(c);
  }


  private isAtEnd() {
    return this.current >= this.source.length;
  }


  private isDigit(c: string) {
    return c >= '0' && c <= '9'
  }


  private identifier() {
    console.log(this.isAlphaNumeric(this.peek()));
    while(this.isAlphaNumeric(this.peek())) {
      this.advance();
    }

    const text: string = this.source.substring(this.start, this.current);
    const tokenType: TokenType = Keywords[text] || TokenType.IDENTIFIER;
    this.addToken(tokenType);
  }


  private match(expected: string) {
    if(this.isAtEnd()) return false;
    if(this.source.charAt(this.current) !== expected) return false;
    this.current++;
    return true;
  }


  private number() {
    while(this.isDigit(this.peek())) this.advance();
    if(this.peek() === '.' && this.isDigit(this.peekNext())) {
      this.advance();
      while(this.isDigit(this.peek())) this.advance();
    }

    this.addToken(TokenType.NUMBER, 
      Number(this.source.substring(this.start, this.current))
    );
  }


  private peek() {
    if(this.isAtEnd()) return '\0';
    return this.source.charAt(this.current);
  }


  private peekNext() {
    if(this.current + 1 >= this.source.length) return '\0';
    return this.source.charAt(this.current + 1);
  }


  private scanToken() {
    const c: string = this.advance();
    switch(c) {

      // single character lexemes
      case '(': this.addToken(TokenType.LEFT_PAREN); break;
      case ')': this.addToken(TokenType.RIGHT_PAREN); break;
      case '{': this.addToken(TokenType.LEFT_BRACE); break;
      case '}': this.addToken(TokenType.RIGHT_BRACE); break;
      case ',': this.addToken(TokenType.COMMA); break;
      case '.': this.addToken(TokenType.DOT); break;
      case '-': this.addToken(TokenType.MINUS); break;
      case '+': this.addToken(TokenType.PLUS); break;
      case ';': this.addToken(TokenType.SEMICOLON); break;
      case '*': this.addToken(TokenType.STAR); break;

      // operators
      case '!': 
        this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG); 
        break;
      case '=': 
        this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL :TokenType.EQUAL); 
        break;
      case '<':
        this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
        break;
      case '>': 
        this.addToken(
          this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER); 
        break;

      // look for comments
      case '/':
        if(this.match('/')) {
          while(this.peek() !== '\n' && !this.isAtEnd()) this.advance();
        } else {
          this.addToken(TokenType.SLASH);
        }
        break;

      // deal with whitespace
      case ' ':
      case '\r':
      case '\t':
        break; // ignore
      case '\n': this.line++; break;

      // deal with string literals
      case '"': this.string(); break;

      default:
        if(this.isDigit(c)) {
          this.number();
        } else if(this.isAlpha(c)) {
          this.identifier();
        } else {
          error(this.line, "Unexpected character.");
        }
        break;
    }
  }


  public scanTokens() {
    while(!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }
    this.tokens.push(new Token(TokenType.EOF, '', null, this.line));
  }


  private string() {
    while(this.peek() !== '"' && !this.isAtEnd()) {
      if(this.peek() !== '\n') this.line++;
      this.advance();
    }

    if(!this.isAtEnd()) {
      error(this.line, 'unterminated string');
    }

    this.advance();
    const value: string = this.source.substring(
      this.start + 1, this.current - 1);
    this.addToken(TokenType.STRING, value);
  }


}