import { SignedXml } from 'xml-crypto';

export interface IKeyInfoProvider {
  getKeyInfo(): string;
  getKey(): string | Buffer;
}

export interface ISignXmlOptions {
  targetElementId: string;
  certificatePath?: string;
  keyPath?: string;
  isLoteSignature?: boolean;
}

export interface ISignatureResult {
  success: boolean;
  signedXml: string;
  digestValue?: string;
  error?: string;
  debugInfo?: {
    originalSize: number;
    signedSize: number;
    transforms: string[];
    canonicalization: string;
  };
}

export interface ICertificateCache {
  cert: string;
  key: string;
  expiry: Date;
}