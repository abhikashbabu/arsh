import { getDoctors, getHomeData, getSpecialities } from "../lib/api";
import { HomePageClient } from "./HomePageClient";

export default async function HomePage() {
  const [home, specialities, doctors] = await Promise.all([
    getHomeData().catch(() => null),
    getSpecialities().catch(() => []),
    getDoctors().catch(() => []),
  ]);

  const mergedHome = home ? {
    ...home,
    specialities: specialities.length ? specialities : home.specialities,
    doctors: doctors.length ? doctors.slice(0, 4) : home.doctors,
  } : null;

  return <HomePageClient home={mergedHome} />;
}
