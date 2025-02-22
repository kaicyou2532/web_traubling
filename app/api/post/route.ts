import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

const POST = async (req: NextRequest) => {
    const { countryId, cityId, troubleId, travelMonth, travelYear, content, title } = await req.json()
    const session = await auth()
    if (!session?.user?.id) {
        throw Error("Unauthorized")
    }

    if (travelMonth < 1 || travelMonth > 12) {
        throw Error("Invalid travel month")
    }
    if (travelYear < 2005 || travelYear > 2025) {
        throw Error("Invalid travel year")
    }


    const post = await prisma.post.create({
        data: {
            userId: session.user.id,
            countryId,
            cityId,
            troubleId,
            travelMonth,
            travelYear,
            content,
            title
        }
    })
    return NextResponse.json(post, { status: 201 })
}

export { POST }
