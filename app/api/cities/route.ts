import { NextResponse } from "next/server";
import { PrismaClient, type City, type Country } from "@prisma/client";

const prisma = new PrismaClient();

type GroupedData = {
  [key: number]: {
    id: number;
    jaName: string;
    cities: {
      id: number;
      enName: string;
      jaName: string;
      Photourl: string;
    }[];
  };
}

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      where: {
        countryId: { not: 1 }, 
      },
      include: {
        country: true, 
      },
    });


    const groupedData = cities.reduce((acc: GroupedData, city: City & { country: Country }) => {
      const countryId = city.countryId;
      if (!acc[countryId]) {
        acc[countryId] = {
          id: city.countryId,
          jaName: city.country.jaName,
          cities: [],
        };
      }
      acc[countryId].cities.push({
        id: city.id,
        enName: city.enName,
        jaName: city.jaName,
        Photourl: city.photoUrl ?? "",
      });
      return acc;
    }, {} as GroupedData);

    return NextResponse.json(Object.values(groupedData)); 
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }

}
