/**
 * A simple heuristic to detect if a string is likely a code snippet.
 * @param text The text to check.
 * @returns boolean
 */
export const isCodeSnippet = (text: string): boolean => {
  // Rule 1: Check for multiple lines and indentation
  const lines = text.split('\n');
  if (lines.length > 2) {
    const indentedLines = lines.filter(line => /^\s{2,}/.test(line)).length;
    if (indentedLines > 0) {
      return true;
    }
  }

  // Rule 2: Check for common code symbols.
  // A high density of these symbols suggests it's code.
  const codeSymbols = ['{', '}', '(', ')', '[', ']', ';', '=', '=>', '->', '<', '>'];
  let symbolCount = 0;
  for (const char of text) {
    if (codeSymbols.includes(char)) {
      symbolCount++;
    }
  }

  // If more than 20% of the text length is symbols, or there are more than 3 symbols
  // in a short text, it's likely code.
  if (symbolCount > 3 || (text.length > 0 && symbolCount / text.length > 0.2)) {
      return true;
  }

  // Rule 3: Check for common keywords
  const keywords = [
    'const', 'let', 'var', 'function', 'return', 'import', 'export',
    'class', 'if', 'else', 'for', 'while', 'switch', 'case',
    'def', 'print', 'lambda', 'import', 'from',
    'public', 'private', 'static', 'void', 'int', 'string'
  ];
  const wordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
  const matches = text.match(wordRegex);
  if (matches && matches.length > 1) {
    return true;
  }
  
  // Rule 4: Check for markdown code block syntax
  if (text.includes('```')) {
    return true;
  }

  return false;
};
