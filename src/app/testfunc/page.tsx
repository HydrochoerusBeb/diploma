"use client";

import { PostPidor } from "@/utils/api/api";
import { PidorRequest } from "@/utils/types/PidorResonseType";
import { AxiosResponse } from "axios";
import { useEffect, useState } from "react";

export default function PidorPage() {
  const [mocha, setMocha] = useState<AxiosResponse>();
  const [string, setString] = useState("");
  const [captured, setCaptured] = useState<PidorRequest | undefined>();
  useEffect(() => {
    if (mocha) {
      console.log();
    }
  }, [mocha]);

  const Pidor = () => {
    if (captured != undefined) {
      PostPidor(captured)
        .then((data) => setMocha(data))
        .catch(console.error);
    }
  };

  const addNumber = () => {
    const num = Number(string.trim());

    if (!isNaN(num)) {
      setCaptured((prev) => {
        if (!prev) {
          return { numbers: [num] };
        }
        if (prev.numbers.length < 2) {
          return { ...prev, numbers: [...prev.numbers, num] };
        }
        return prev;
      });
      setString("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {mocha && <div>{mocha?.data.sum}</div>}

      <input value={string} onChange={(e) => setString(e.target.value)}></input>

      <button className="text-white" onClick={() => addNumber()}>+</button>

      {captured?.numbers?.map((e: number) => (
        <div className="text-white" key={e}>{e}</div>
      ))}

      <button className="text-white" onClick={() => Pidor()}> Отправить </button>
    </div>
  );
}
