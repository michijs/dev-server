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
          } else if (char === "?") {
            return ".";
          } else if (regexSpecialChars.includes(char)) {
            return "\\" + char;
          } else {
            return char;
          }
        })
        .join("") +
      "$",
  );
}
