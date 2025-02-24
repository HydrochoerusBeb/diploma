import { HelloResponse } from "../types/HelloResponseType";
import { PidorRequest } from "../types/PidorResonseType";
import { api } from "./apiConfig";

export async function getData(): Promise<HelloResponse> {
  const res = await api.get("/hello");
  return res.data;
}


export async function PostPidor(params:PidorRequest) {
  const res = await api.post('/pidor', params)
  return res
}

