import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ReactNode } from "react"
import { signIn } from "@/auth"
import { SiDiscord, SiGoogle } from "@icons-pack/react-simple-icons"

type Props = {
  children: ReactNode
}

export function AuthModal({ children }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-[300px] bg-white !rounded-[24px] p-0 border-none">
        <div className="px-8 py-8">
          <h2 className="text-xl font-semibold text-custom-green mb-8 text-center">
            traublingにログインして
            <br />
            トラブルを共有しよう！
          </h2>
          <div className="space-y-4">
            <form action={async () => {
              "use server"
              await signIn("google")
            }}>
              <Button
                variant="outline"
                className="flex items-center gap-3 w-full h-12 border-2 rounded-xl border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <SiGoogle />
                Googleアカウントを使う
              </Button>
            </form>
            <form action={async () => {
              "use server"
              await signIn("discord")
            }}>
              <Button
                variant="outline"
                className="flex items-center gap-3 w-full h-12 border-2 rounded-xl border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <SiDiscord />
                Discordアカウントを使う
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
