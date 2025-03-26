"use client";

import { getSession } from "@/actions/auth";
import {
  getParty,
} from "@/actions/companyActions";  
import { PartyType } from "@/utils/types/PartyType";
import { SessionPayload } from "@/utils/types/SessionPayload";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export const TestCompany = {
  title: "test company",
  partiesCount: 2,
  parties: [
    {
      id: 1,
      name: "party 1",
      characterCount: 15,
      mainCharacters: 4,
    },
    {},
  ],
};

export default function PartyPage() {
  const [party, setParty] = useState<PartyType | null>(null);
  const [user, setUser] = useState<SessionPayload | null>(null);
  const params = useParams();

  useEffect(() => {
    async function fetchUser() {
      const session = await getSession();
      console.log("Fetched session:", session);
      if (session) {
        setUser(session as SessionPayload);
      } else {
        setUser(null);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    async function fetchParty() {
      const data = await getParty({
        id: Number(params.id),
        userId: user!.id,
      });
      console.log(data);

      setParty(data);
    }
    fetchParty();

    console.log(party);
  }, [user]);

  return (
    <div className="flex w-full h-full ">
      <h2>{party?.title}</h2>
    </div>
  );
}
