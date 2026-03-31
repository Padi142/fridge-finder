import "react-native-url-polyfill/auto";
import { Client } from "react-native-appwrite";

const endpoint = "https://fra.cloud.appwrite.io/v1";


export const client = new Client()
  .setProject("fridge-finder")
  .setEndpoint(endpoint);


