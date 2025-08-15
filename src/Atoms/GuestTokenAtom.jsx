import { atomWithStorage } from "jotai/utils";
export const guestTokenAtom = atomWithStorage("sessionToken", null);