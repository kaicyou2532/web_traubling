import JapaneseCitiesPage from "@/app/components/JapaneseCitiesPage";
import { prisma } from "@lib/prisma";

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export default async function Page() {

  const japan = await prisma.country.findUnique({
    where: {
      id: 1
    },
    include: {
      cities: true
    }
  })

  if(!japan){
    return <div>ページがありません。</div>
  }

  const { cities } = japan

  return (
    <div>
      <JapaneseCitiesPage
      cities={cities}
      />
    </div>
  );
}
