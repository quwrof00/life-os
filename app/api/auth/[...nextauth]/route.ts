import NextAuth from "next-auth";
import { getAuthOptions } from "@/lib/auth";

const handler = NextAuth(getAuthOptions());
export const { GET, POST } = handler;
