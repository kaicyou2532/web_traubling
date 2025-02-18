import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"



const POST = async (req: NextRequest) => {
    const { countryId, troubleId, travelMonth, travelYear, content, title } = await req.json()
    const session = await auth()
    if (!session?.user?.id) {
        throw Error("Unauthorized")
    }
    const post = await prisma.post.create({
        data: {
            userId: session.user.id,
            countryId,
            troubleId,
            travelMonth,
            travelYear,
            content,
            title,
            isDraft: true
        }
    })
    return NextResponse.json(post, { status: 201 })
}

export default POST
