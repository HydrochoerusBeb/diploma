import { HelloResponse } from "../types/HelloResponseType";
import { PidorRequest } from "../types/PidorResonseType";
import { RegisterRequest } from "../types/RegisterRequest";
import { api } from "./apiConfig";

export async function getData(): Promise<HelloResponse> {
  const res = await api.get("/hello");
  return res.data;
}

export async function PostPidor(params: PidorRequest) {
  const res = await api.post("/pidor", params);
  return res;
}

export async function postRegister(params: RegisterRequest) {
  const res = await api.post("/reg", params, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log(res.data);
  return res;
}
