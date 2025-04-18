"use client";

import { postRegister } from "@/utils/api/api";
import { Button, Form, Input } from "@heroui/react";
import { redirect } from "next/navigation";
import { useState } from "react";


export default function RegisterPage() {    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const register = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const res = await postRegister({ email, password });
        console.log(res.data); // для отладки
        if (res.status === 200 || res.status === 201) {
          redirect("/login");
        }
      } catch (error) {
        console.error("Ошибка регистрации:", error);
      }
    };
    


  return (
    <div className="flex w-full h-full justify-center items-center">
        <div>
        <Form onSubmit={register} className="w-[300px] mx-auto m-[20px] border border-[#090d15] rounded-lg bg-gray-900 p-2">
          <Input
            isRequired
            errorMessage="Please enter a valid email"
            label="Email"
            labelPlacement="outside"
            name="email"
            placeholder="Enter your email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-[200px]"
          ></Input>
          <Input
            isRequired
            errorMessage="Please enter a valid assword"
            label="Password"
            labelPlacement="outside"
            name="password"
            placeholder="Enter your password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-[200px]"
          ></Input>
          <Button type="submit"> Submit</Button>
        </Form>
        </div>
    </div>
  );
}