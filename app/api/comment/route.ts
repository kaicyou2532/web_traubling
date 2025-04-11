import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const postId = searchParams.get
    if (!postId) {
        return NextResponse.json({ error: 'postId is required' }, { status: 400 })
      }
    const comments = await prisma.comment.findMany({
        where: {postId: Number(postId)},
        include: {User: true},
        orderBy: {createAt: "asc"},
    })
    return NextResponse.json(comments)
}



const POST = async (req: NextRequest) => {
    const session = await getServerSession(authOptions)
    if (!session?.user?.Id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    const body = await req.json()
    const{postId, content} = body
    if (!postId || !content) {
        return NextResponse.json({ error: 'invalid data' }, { status: 400 })
      }
    const comment = await prisma.comment.create({
        data: {
            content,
            postId: Number(postId),
        },
    })

    return NextResponse.json(post, { status: 201 })
    
}

export { POST }
