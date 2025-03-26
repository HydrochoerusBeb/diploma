"use client";

import { getSession } from "@/actions/auth";
import { getCompany, createParty, getParties } from "@/actions/companyActions";
import PartyCard from "@/components/PartyCard/PartyCard";
import { CompanyType } from "@/utils/types/CompanyType";
import { PartyType } from "@/utils/types/PartyType";
import { SessionPayload } from "@/utils/types/SessionPayload";
import {
  Spinner,
  Modal,
  useDisclosure,
  Button,
  ModalContent,
} from "@heroui/react";
import Link from "next/link";
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

export default function CompanyPage() {
  const [company, setCompany] = useState<CompanyType | null>(null);
  const [user, setUser] = useState<SessionPayload | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [party, setParty] = useState<PartyType[]>([]);
  const [partyTitle, setPartyTitle] = useState("");
  const [partyDescription, setPartyDescription] = useState("");
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
    async function fetchCompany() {
      const data = await getCompany({
        id: Number(params.id),
        userId: user!.id,
      });
      console.log(data);

      setCompany(data);
    }
    fetchCompany();

    console.log(party);
  }, [user]);

  useEffect(() => {
    async function fetchParties() {
      if (!user || !company) return; // Проверяем перед вызовом

      const data = await getParties(user.id, company.id);
      console.log("Fetched parties:", data);

      setParty(data);
    }

    fetchParties();
  }, [user, company]);

  const handleCreateParty = async () => {
    if (!company || !user) return;
    try {
      const newParty = await createParty({
        title: partyTitle,
        description: partyDescription,
        userId: user.id,
        compainId: company.id,
      });
      console.log("Party created:", newParty);
      setPartyTitle("");
      setPartyDescription("");
      
    } catch (error) {
      console.error("Error creating party:", error);
    }
  };

  return (
    <div className="flex w-full h-full ">
      <div>
        {company ? company.title : <Spinner></Spinner>}
        <div className="flex flex-wrap gap-4 p-4">
          {party.length === 0 ? (
            <Spinner></Spinner>
          ) : (
            party.map((x) => (
              <Link key={x.id} href={`/party/${x.self}`} passHref>
                <PartyCard {...x}></PartyCard>
              </Link>
            ))
          )}
          <Button
            //  onClick={() => setIsModalOpen(true)}
            onPress={onOpen}
            className="relative w-[250px] h-[300px] rounded-xl overflow-hidden bg-gray-500 flex justify-center items-center"
          >
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            <div className="text-white z-10 text-5xl">+</div>
          </Button>
        </div>

        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="sm">
          <ModalContent>
            {(onClose) => (
              <div className="p-4 bg-white rounded">
                <h2 className="text-lg font-semibold">Создать партию</h2>
                <input
                  type="text"
                  placeholder="Название партии"
                  value={partyTitle}
                  onChange={(e) => setPartyTitle(e.target.value)}
                  className="w-full p-2 border rounded my-2"
                />
                <textarea
                  placeholder="Описание партии"
                  value={partyDescription}
                  onChange={(e) => setPartyDescription(e.target.value)}
                  className="w-full p-2 border rounded my-2"
                />
                <Button
                  onPress={() => {
                    handleCreateParty();
                    onClose();
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Создать
                </Button>
              </div>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}
