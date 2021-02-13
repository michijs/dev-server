export function minifyHTML(string) {
    const removeEnterResult = string.replace(/\s+/g, ' ').trim();
    return removeEnterResult.replace(/> </g, '><').trim();;
}