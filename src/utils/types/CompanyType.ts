import { PartyType } from "./PartyType";

export interface CompanyType {
  id: string;
  self: number;
  title: string;
  description: string;
  userId: string
  image?: string;
  count?: number;
  parties?: PartyType[];
}
