import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? (() => { throw new Error("NEXT_PUBLIC_API_URL não definida no .env") })(),
  withCredentials: false,
});
