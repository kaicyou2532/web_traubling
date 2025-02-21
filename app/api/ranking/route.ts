import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const GET = async () => {
    const post = await prisma.post.findMany({
        where: {
            isDraft: false
        },
        take: 3,
        orderBy: {
            likes: {
                _count: "desc",
            },
        },
    })

    return NextResponse.json(post, { status: 200 })
}

export { GET }