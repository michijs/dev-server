declare module "*.svg" {
  const content: string;
  export default content;
}
declare module "*.css" {
  const content: CSSStyleSheet;
  export default content;
}
