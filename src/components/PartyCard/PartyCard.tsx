"use client";

import { PartyType } from "@/utils/types/PartyType";

export default function PartyCard(params: PartyType) {
  return (
    <div
      className="relative w-[250px] h-[300px] rounded-xl overflow-hidden bg-gray-500"
      style={{ backgroundImage: params.image ? `url(${params.image})` : "none", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="absolute bottom-4 right-4 text-right text-white z-10">
        <h2 className="text-lg font-bold">{params.title}</h2>
        <p className="text-sm opacity-80">{params.description}</p>
      </div>
    </div>
  );
}
