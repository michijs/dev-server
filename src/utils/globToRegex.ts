export function globToRegex(glob: string) {
  const regexSpecialChars = [
    ".",
    "\\",
    "+",
    "*",
    "?",
    "|",
    "(",
    ")",
    "[",
    "]",
    "{",
    "}",
    "^",
    "$",
  ];

  return new RegExp(
    "^" +
      glob
        .split("")
        .map((char) => {
          if (char === "*") {
            return ".*";
          }
          if (char === "?") {
            return ".";
          }
          if (regexSpecialChars.includes(char)) {
            return "\\" + char;
          }
          return char;
        })
        .join("") +
      "$",
  );
}
