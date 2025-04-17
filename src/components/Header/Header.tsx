"use client";

import { getSession, logout } from "@/actions/auth";
import { SessionPayload } from "@/utils/types/SessionPayload";
import { Button, Link } from "@heroui/react";
import { useEffect, useState } from "react";

const Header = () => {
  
  const [session, setSession] = useState<SessionPayload | null>(null);

  useEffect(() => {
    async function fetchSession() {
      const mySession = await getSession();
      setSession(mySession || null);
    }
    fetchSession();
  }, [])

  return (
    <header className="relative">
      <div className="relative z-10 container h-[56px] sm:h-[100px] flex flex-row items-center justify-between border-b border-grey-100 xl:h-[141px] px-5- py-[18px]">
        {/* <Navbar>    </Navbar> */}
        <div className="flex flex-row items-center justify-between w-[30%]">
          <Link href="/testfunc">Test Func</Link>
          <Link href="/companies">Companies</Link>
          {!session && <Link href="/login">Login</Link>}
        </div>

        <Button onPress={() => logout()} color="primary">LOGOUT</Button>
      </div>
    </header>
  );
};

export default Header;
