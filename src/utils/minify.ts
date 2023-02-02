export function replaceEnter(json: string, replaceWith: string = '') {
  return json.replace(/\s+/g, replaceWith).trim();
}
export function minifyXMLLike(xml: string) {
  const removeEnterResult = replaceEnter(xml, ' ');
  return removeEnterResult.replace(/> </g, '><').trim();
}