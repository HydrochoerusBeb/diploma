'use client'

import { getData } from "@/utils/api/api";
import { useEffect, useState } from "react";

export default function MainPage() {
  const [mocha, setMocha] = useState('')

  useEffect(() => {
    getData().then((data) => setMocha(data.message)).catch(console.error);
  }, []);


    return (
      <div>
          {mocha}
      </div>
    );
  }
  