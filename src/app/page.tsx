import { getAllDigests } from "../lib/news";
import TodayNews from "../components/TodayNews";

export default function HomePage() {
  const digests = getAllDigests();
  return <TodayNews digests={digests} />;
}
