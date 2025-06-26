import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs";
import prisma from "./prisma";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {label: "Email", type: "text"},
                password: {label: "Password", type: "password"},
            }, 
            async authorize(credentials){
                if (!credentials?.email || !credentials.password) {
                    throw new Error("Missing email or password");
                }
                try {
                    const user = await prisma.user.findUnique({where: {email: credentials.email}});
                    if (!user) throw new Error("No user found with this email");

                    if (!user.password) throw new Error("User has no password set");
                    const isValid = await bcrypt.compare(credentials.password, user.password);
                    if (!isValid) throw new Error("Invalid password");
                    
                    return {id: user.id.toString(), email: user.email, name: user.name, image: user.image}
                } catch (error) {
                    console.error("Auth error:", error);
                    throw error;
                }
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        }),
    ],
    callbacks: {
        async jwt({token, user}) {
            if (user) { 
                token.id = user.id;
                token.name = user.name;
                token.picture = user.image;
                token.email = user.email;
            }
            return token;
        },
        async session({session, token}) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.name = token.name as string;
                session.user.image = token.picture as string;
                session.user.email = token.email as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 30*24*60*60,
    },
    secret: process.env.NEXTAUTH_SECRET
}