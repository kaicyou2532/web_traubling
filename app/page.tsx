import { prisma } from "@lib/prisma";
import Home from "./components/Home";


export default async function Page() {

  const japan = await prisma.country.findUnique({
    where: {
      id: 1
    },
    include: {
      cities: true
    }
  })

  if (!japan) {
    return <div>日本が取得できていません。</div>
  }

  const othersCities = await prisma.city.findMany({
    where: {
      countryId: {
        not: 1
      }
    }
  })

  const { cities: japanCities } = japan

  return (
    <div>
      <Home
        japanCities={japanCities}
        otherCities={othersCities}
      />
    </div>
  );
}
