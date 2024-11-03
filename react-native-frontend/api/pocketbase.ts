import type { TypedPocketBase } from "./pocketbase-types";
import AsyncStorage from '@react-native-async-storage/async-storage';
import PocketBase, { AsyncAuthStore } from 'pocketbase';
import eventsource from "react-native-sse";
// @ts-ignore
global.EventSource = eventsource;

const store = new AsyncAuthStore({
    save: async (serialized) => AsyncStorage.setItem('pb_auth', serialized),
    initial: AsyncStorage.getItem('pb_auth'),
});

export const pb = new PocketBase("http://192.168.1.126:8090", store) as TypedPocketBase;