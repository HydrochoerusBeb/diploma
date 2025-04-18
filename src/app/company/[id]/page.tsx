"use client";

import { getSession } from "@/actions/auth";
import {
  getCompany,
  createParty,
  getParties,
  createMainCharacter,
  createNpcCharacter,
} from "@/actions/companyActions";
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

export default function CompanyPage() {
  const [company, setCompany] = useState<CompanyType | null>(null);
  const [user, setUser] = useState<SessionPayload | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [party, setParty] = useState<PartyType[]>([]);

  const [isCharModalOpen, setCharModalOpen] = useState(false);
  const [charType, setCharType] = useState<"main" | "npc">("main");
  const [charName, setCharName] = useState("");
  const [charClass, setCharClass] = useState("");
  const [charRace, setCharRace] = useState("");
  const [charDesc, setCharDesc] = useState("");
  const [charLevel, setCharLevel] = useState(1);
  const [npcLocation, setNpcLocation] = useState("");
  const [npcOccupation, setNpcOccupation] = useState("");

  const [partyTitle, setPartyTitle] = useState("");
  const [partyDescription, setPartyDescription] = useState("");
  const params = useParams();

  useEffect(() => {
    async function fetchUser() {
      const session = await getSession();
      if (session) setUser(session as SessionPayload);
    }
    fetchUser();
  }, []);

  useEffect(() => {
    if (!user) return;
    async function fetchCompany() {
      const data = await getCompany({
        id: Number(params.id),
        userId: user.id,
      });
      setCompany(data);
      if (data?.self) {
        localStorage.setItem("dnd-company-self", data.self.toString());
        console.log("[CompanyPage] Сохранил self кампании в LS:", data.self);
      }
    }
    fetchCompany();
  }, [user]);

  useEffect(() => {
    if (!user || !company) return;
    async function fetchParties() {
      const data = await getParties(user.id, company.id);
      setParty(data);
    }
    fetchParties();
  }, [user, company]);

  const handleCreateParty = async () => {
    if (!company || !user) return;
    try {
      await createParty({
        title: partyTitle,
        description: partyDescription,
        userId: user.id,
        compainId: company.id,
      });
      setPartyTitle("");
      setPartyDescription("");
    } catch (error) {
      console.error("Error creating party:", error);
    }
  };

  const handleCreateCharacter = async () => {
    if (!user || !company) return;
    try {
      if (charType === "main") {
        await createMainCharacter({
          name: charName,
          className: charClass,
          race: charRace,
          description: charDesc,
          avatar: null,
          level: charLevel,
          userId: user.id,
          compainId: company.id,
        });
      } else {
        await createNpcCharacter({
          name: charName,
          className: charClass,
          race: charRace,
          description: charDesc,
          avatar: null,
          level: charLevel,
          location: npcLocation,
          occupation: npcOccupation,
          userId: user.id,
          compainId: company.id,
        });
      }
      setCharModalOpen(false);
    } catch (err) {
      console.error("Ошибка создания персонажа", err);
    }
  };

  return (
    <div className="flex w-full h-full flex-col p-4">
      <h1 className="text-2xl font-bold mb-2">
        {company ? company.title : <Spinner />}
      </h1>

      <div className="flex space-x-2 mb-4">
        <Button onPress={onOpen}>Создать партию</Button>
        <Button onPress={() => setCharModalOpen(true)}>Добавить персонажа</Button>
      </div>

      <div className="flex flex-wrap gap-4">
        {party.length === 0 ? (
          <Spinner />
        ) : (
          party.map((x) => (
            <Link key={x.id} href={`/party/${x.self}`} passHref>
              <PartyCard {...x} />
            </Link>
          ))
        )}
      </div>

      {/* Модалка создания партии */}
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

      {/* Модалка создания персонажа */}
      {isCharModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-[400px] space-y-3">
            <h2 className="text-xl font-semibold">Создать персонажа</h2>

            <div className="flex space-x-2">
              <Button
                className={charType === "main" ? "bg-blue-600 text-white" : ""}
                onClick={() => setCharType("main")}
              >
                Игровой
              </Button>
              <Button
                className={charType === "npc" ? "bg-blue-600 text-white" : ""}
                onClick={() => setCharType("npc")}
              >
                NPC
              </Button>
            </div>

            <input
              className="w-full p-2 border rounded"
              placeholder="Имя"
              value={charName}
              onChange={(e) => setCharName(e.target.value)}
            />
            <input
              className="w-full p-2 border rounded"
              placeholder="Класс"
              value={charClass}
              onChange={(e) => setCharClass(e.target.value)}
            />
            <input
              className="w-full p-2 border rounded"
              placeholder="Раса"
              value={charRace}
              onChange={(e) => setCharRace(e.target.value)}
            />
            <input
              className="w-full p-2 border rounded"
              placeholder="Описание"
              value={charDesc}
              onChange={(e) => setCharDesc(e.target.value)}
            />
            <input
              className="w-full p-2 border rounded"
              placeholder="Уровень"
              type="number"
              value={charLevel}
              onChange={(e) => setCharLevel(Number(e.target.value))}
            />

            {charType === "npc" && (
              <>
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Локация"
                  value={npcLocation}
                  onChange={(e) => setNpcLocation(e.target.value)}
                />
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Роль"
                  value={npcOccupation}
                  onChange={(e) => setNpcOccupation(e.target.value)}
                />
              </>
            )}

            <div className="flex justify-between pt-2">
              <Button onClick={() => setCharModalOpen(false)}>Отмена</Button>
              <Button
                className="bg-green-600 text-white"
                onClick={handleCreateCharacter}
              >
                Создать
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
