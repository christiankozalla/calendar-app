import type { TypedPocketBase } from "./pocketbase-types";
import PocketBase from "pocketbase";

export const pb = new PocketBase("http://localhost:8090") as TypedPocketBase;
