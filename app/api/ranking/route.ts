import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const GET = async () => {
    const post = await prisma.post.findMany({
        take: 3,
        orderBy: {
            likeCount: "desc",
        },
    })

    return NextResponse.json(post, { status: 200 })
}

export { GET }