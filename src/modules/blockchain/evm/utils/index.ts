import { isURL } from 'class-validator';

export function isIPFSHash(str: string): boolean {
  const ipfsHashPattern = /^Qm[0-9a-zA-Z]+$/;
  return ipfsHashPattern.test(str);
}

export function sanitizeUri(uri: string): string {
  uri = uri.replace(/^ipfs:\/\//, 'https://ipfs.io/ipfs/');

  if (!isURL(uri) && isIPFSHash(uri)) {
    return `https://ipfs.io/ipfs/${uri}`;
  }
  return uri;
}
