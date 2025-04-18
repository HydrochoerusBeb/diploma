"use client";

import { getSession } from "@/actions/auth";
import { createCompany, getCompanies } from "@/actions/companyActions";
import CompanyCard from "@/components/CompanyCard/CompanyCard";
import { CompanyType } from "@/utils/types/CompanyType";
import { SessionPayload } from "@/utils/types/SessionPayload";
import { Spinner } from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
export default function Companies() {
  const [showForm, setShowForm] = useState(false);
  const [companies, setCompanies] = useState<CompanyType[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [user, setUser] = useState<SessionPayload | null>(null)
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      const session = await getSession();
      console.log('Fetched session:', session);
      if (session) {
        setUser(session as SessionPayload);
      } else {
        setUser(null);
      }
    }
    fetchUser();
  }, []);
  useEffect(() => {
    if (user) {
      async function fetchCompanies() {
        const data = await getCompanies(user!.id);
        console.log(data);

        setCompanies(data);
      }
      fetchCompanies();
    }
  }, [user]);

  const handleSubmit = async () => {
    console.log('Submitting...', title, description, user);
    if (!title.trim() || !description.trim() || !user) return;
    const userId = user.id
    await createCompany({ title, description, userId });
    router.refresh();
    setShowForm(false);
    setTitle("");
    setDescription("");
  };
  return (
    <div className="p-4">
      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Создать компанию
      </button>

      {showForm && (
        <div className="p-4 border rounded-lg bg-gray-800">
          <input
            type="text"
            placeholder="Название компании"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 mb-2 border rounded-lg"
          />
          <textarea
            placeholder="Описание компании"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 mb-2 border rounded-lg"
          ></textarea>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Добавить
          </button>
        </div>
      )}
      <div className="flex flex-wrap gap-4 p-4">
      {companies.length === 0 ? (
          <Spinner></Spinner>
        ) : (
          companies.map((x) => (
            <Link key={x.id} href={`/company/${x.self}`} passHref>
              <CompanyCard {...x}></CompanyCard>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
