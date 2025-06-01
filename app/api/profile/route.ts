import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { PrismaClient } from "@prisma/client"
import { authOptions } from "@/app/api/auth/[...nextauth]/route" // authOptionsのパスを適宜修正してください

const prisma = new PrismaClient()

/**
 * @route GET /api/user/profile
 * @description ログインユーザーのプロフィール情報を取得します。
 * @returns {Response} プロフィール情報、またはエラーメッセージ
 */
export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.email) {
    return NextResponse.json({ message: "認証されていません。" }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true, // usernameとして使用
        image: true,
        // profileテーブルが存在しないため、Userモデルのフィールドを使用するか、別途Profileモデルを作成する必要があります。
        // 今回はUserモデルのフィールドをProfileとして利用します。
        // location, website, bioフィールドはUserモデルに存在しないため、適宜Prismaスキーマを更新してください。
      },
    })

    if (!user) {
      return NextResponse.json({ message: "ユーザーが見つかりません。" }, { status: 404 })
    }

    // `mypage.tsx` の Profile 型に合わせてデータを整形します。
    // Userモデルにlocation, website, bioがないため、ここでは空文字列を設定しています。
    // 必要に応じてPrismaスキーマにこれらのフィールドを追加してください。
    const profile = {
      name: user.name || "",
      username: user.email || "", // emailをusernameとして利用
      location: "", // Userモデルにlocationフィールドがないため
      website: "", // Userモデルにwebsiteフィールドがないため
      bio: "", // Userモデルにbioフィールドがないため
      image: user.image || "",
    }

    return NextResponse.json(profile, { status: 200 })
  } catch (error) {
    console.error("プロフィール取得エラー:", error)
    return NextResponse.json({ message: "プロフィール取得に失敗しました。" }, { status: 500 })
  }
}

/**
 * @route PUT /api/user/profile
 * @description ログインユーザーのプロフィール情報を更新します。
 * @param {Request} request - リクエストボディに更新するプロフィール情報 (name, location, website, bio) を含みます。
 * @returns {Response} 更新されたプロフィール情報、またはエラーメッセージ
 */
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.email) {
    return NextResponse.json({ message: "認証されていません。" }, { status: 401 })
  }

  try {
    const { name, username, location, website, bio, image } = await request.json()

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name,
        // usernameは現状emailで代用しているため、更新はメールアドレスの変更となる。
        // もし別途usernameフィールドをUserモデルに追加した場合、ここを適宜変更してください。
        email: username || session.user.email, // usernameとしてemailを更新するか、新しいusernameフィールドを更新
        image: image,
        // location, website, bioはUserモデルに存在しないため、このままでは更新できません。
        // Prismaスキーマにこれらのフィールドを追加し、ここに更新ロジックを追加してください。
      },
    })

    // 更新後のプロフィール情報を整形して返します
    const updatedProfile = {
      name: updatedUser.name || "",
      username: updatedUser.email || "",
      location: location || "", // 更新リクエストからのlocationを反映 (DBには保存されない)
      website: website || "", // 更新リクエストからのwebsiteを反映 (DBには保存されない)
      bio: bio || "", // 更新リクエストからのbioを反映 (DBには保存されない)
      image: updatedUser.image || "",
    }

    return NextResponse.json(updatedProfile, { status: 200 })
  } catch (error) {
    console.error("プロフィール更新エラー:", error)
    return NextResponse.json({ message: "プロフィールの更新に失敗しました。" }, { status: 500 })
  }
}