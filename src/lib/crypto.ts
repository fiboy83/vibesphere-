import CryptoJS from 'crypto-js';

const getEncryptionSecret = (): string => {
    const secret = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET;
    if (!secret) {
        console.error("Encryption secret not found. Using insecure fallback.");
        return "insecure-fallback-secret";
    }
    return secret;
}

// Generate a deterministic shared secret for two users
const getSharedSecret = (address1: string, address2: string): string => {
    const sortedAddresses = [address1.toLowerCase(), address2.toLowerCase()].sort();
    const combined = sortedAddresses.join('');
    // We hash the combined addresses with a global secret to create the key
    return CryptoJS.SHA256(combined + getEncryptionSecret()).toString();
};

export const encryptMessage = (text: string, selfAddress: string, partnerAddress: string): string => {
    const sharedSecret = getSharedSecret(selfAddress, partnerAddress);
    return CryptoJS.AES.encrypt(text, sharedSecret).toString();
};

export const decryptMessage = (ciphertext: string, selfAddress: string, partnerAddress: string): string => {
    try {
        const sharedSecret = getSharedSecret(selfAddress, partnerAddress);
        const bytes = CryptoJS.AES.decrypt(ciphertext, sharedSecret);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        if (!originalText) {
            return 'Failed to decrypt vibe...';
        }
        return originalText;
    } catch (error) {
        console.error("Decryption failed:", error);
        return 'Failed to decrypt vibe...';
    }
};
