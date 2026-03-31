import { Account, AppwriteException, Models } from "react-native-appwrite";

import { client } from "@/lib/appwrite/client";

const account = new Account(client);

export async function getAccount(): Promise<Models.User | null> {
  try {
    return await account.get();
  } catch (error) {
    if (error instanceof AppwriteException && error.code === 401) {
      return null;
    }

    throw error;
  }
}

export async function createAnonymousSession() {
  await account.createAnonymousSession();
  return getAccount();
}

export async function logout() {
  await account.deleteSession("current");
}
