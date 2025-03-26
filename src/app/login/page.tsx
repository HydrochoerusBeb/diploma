'use client'
import { Button, Form, Input, Link } from "@heroui/react";

import { handleSubmit } from "../api/login/route";
export default function LoginPage() {

  return (
    <div className="flex w-full h-full justify-center items-center">
      <div>
        <Form
          action={handleSubmit}
          className="w-[300px] mx-auto m-[20px] border border-[#090d15] rounded-lg bg-gray-900 p-2"
        >
          <Input
            isRequired
            errorMessage="Please enter a valid email"
            label="Email"
            labelPlacement="outside"
            name="email"
            placeholder="Enter your email"
            type="email"
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
            className="w-[200px]"
          ></Input>
          <Button type="submit"> Submit</Button>
        </Form>
        <Link href="register">Register</Link>
      </div>
    </div>
  );
}
