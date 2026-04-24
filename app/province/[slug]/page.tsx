import { notFound } from "next/navigation";
import { PageTransition } from "@/components/PageTransition";
import { ProvinceExplorer } from "@/components/ProvinceExplorer";
import { getAllProvinces, getProvinceBySlug } from "@/lib/provinceData";

type ProvincePageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return getAllProvinces().map((province) => ({ slug: province.slug }));
}

export default function ProvincePage({ params }: ProvincePageProps) {
  const province = getProvinceBySlug(params.slug);
  if (!province) {
    notFound();
  }

  return (
    <PageTransition>
      <ProvinceExplorer province={province} />
    </PageTransition>
  );
}
