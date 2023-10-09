export function isIPFSHash(str: string): boolean {
  const ipfsHashPattern = /^Qm[0-9a-zA-Z]+$/;
  return ipfsHashPattern.test(str);
}
