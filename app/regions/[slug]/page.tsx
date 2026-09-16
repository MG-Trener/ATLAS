import { notFound } from "next/navigation";
import { getRegionBySlug, regions } from "../../data/regions";
import RegionDetail from "./RegionDetail";

export function generateStaticParams() {
  return regions.map((region) => ({ slug: region.slug }));
}

export default async function RegionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const region = getRegionBySlug(slug);
  if (!region) notFound();
  return <RegionDetail region={region} />;
}
