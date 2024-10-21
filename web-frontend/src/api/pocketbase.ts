import type { TypedPocketBase } from "./pocketbase-types";
import PocketBase from "pocketbase";

export const pb = new PocketBase() as TypedPocketBase;
