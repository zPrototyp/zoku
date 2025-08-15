import { atomWithStorage } from "jotai/utils";

export const authTokenAtom = atomWithStorage("authToken", null);
