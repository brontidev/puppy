import { customAlphabet } from "nanoid";
import { generateSlug } from "random-word-slugs";

export const generate_join_code = customAlphabet('346789ABCDEFGHJKLMNPQRTUVWXYabcdefghijkmnpqrtwxyz', 5)

export function generate_token(): string {
	return crypto.getRandomValues(new Uint8Array(24)).toHex();
}

export function generate_recon_code(): string {
    return `${generateSlug(2)}-${crypto.getRandomValues(new Uint8Array(1)).toString().padStart(3, '0')}`
}
