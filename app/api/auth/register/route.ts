import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest){
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const {username, email, password} = await req.json();
        if (!username || !email || !password) return NextResponse.json({error: "Username, Email and password are required"}, {status: 400});

        const existingUser = await prisma.user.findFirst({where: {email: email}});
        if (existingUser) return NextResponse.json({error: "Email is already registered"}, {status: 400});
        const hashed = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: {
                name: username,
                email: email,
                password: hashed,
            }
        })
        return NextResponse.json({message: "User registered successfully"}, {status: 201});
    } catch (error) {
        return NextResponse.json({error: "Failed to register user"}, {status: 500});
    }
}