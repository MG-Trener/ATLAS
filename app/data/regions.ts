export type RegionProfile = {
  slug: string;
  name: string;
  short: string;
  resistance: number;
  isolates: number;
  mdr: number;
  delta: number;
  labs: number;
  completeness: number;
  astQuality: number;
};

export const regions: RegionProfile[] = [
  { slug: "astana", name: "Астана", short: "AST", resistance: 31.4, isolates: 2268, mdr: 11.9, delta: 4.8, labs: 8, completeness: 96, astQuality: 97 },
  { slug: "almaty", name: "Алматы", short: "ALA", resistance: 33.1, isolates: 2791, mdr: 12.7, delta: 3.7, labs: 11, completeness: 95, astQuality: 96 },
  { slug: "shymkent", name: "Шымкент", short: "SHY", resistance: 27.5, isolates: 1584, mdr: 9.8, delta: 2.4, labs: 6, completeness: 93, astQuality: 95 },
  { slug: "abay", name: "Абайская", short: "ABY", resistance: 35.8, isolates: 968, mdr: 14.2, delta: 5.1, labs: 4, completeness: 88, astQuality: 90 },
  { slug: "akmola", name: "Акмолинская", short: "AKM", resistance: 25.8, isolates: 1370, mdr: 8.2, delta: 1.6, labs: 5, completeness: 91, astQuality: 93 },
  { slug: "aktobe", name: "Актюбинская", short: "AKT", resistance: 21.6, isolates: 1028, mdr: 7.1, delta: 1.2, labs: 4, completeness: 88, astQuality: 90 },
  { slug: "almaty-region", name: "Алматинская", short: "ALM", resistance: 30.7, isolates: 1904, mdr: 10.7, delta: 2.9, labs: 7, completeness: 92, astQuality: 94 },
  { slug: "atyrau", name: "Атырауская", short: "ATY", resistance: 24.1, isolates: 847, mdr: 8.4, delta: 0.9, labs: 3, completeness: 86, astQuality: 89 },
  { slug: "east-kazakhstan", name: "Восточно-Казахстанская", short: "VKO", resistance: 36.4, isolates: 1314, mdr: 15.1, delta: 5.4, labs: 5, completeness: 89, astQuality: 91 },
  { slug: "zhambyl", name: "Жамбылская", short: "ZHM", resistance: 26.9, isolates: 1152, mdr: 8.9, delta: 1.7, labs: 4, completeness: 90, astQuality: 92 },
  { slug: "zhetysu", name: "Жетысуская", short: "ZHT", resistance: 29.8, isolates: 904, mdr: 10.1, delta: 2.1, labs: 4, completeness: 87, astQuality: 90 },
  { slug: "west-kazakhstan", name: "Западно-Казахстанская", short: "ZKO", resistance: 18.9, isolates: 792, mdr: 5.8, delta: -0.4, labs: 3, completeness: 86, astQuality: 89 },
  { slug: "karaganda", name: "Карагандинская", short: "KAR", resistance: 29.8, isolates: 1934, mdr: 10.9, delta: 2.1, labs: 7, completeness: 92, astQuality: 94 },
  { slug: "kostanay", name: "Костанайская", short: "KOS", resistance: 22.7, isolates: 1188, mdr: 6.9, delta: 0.8, labs: 4, completeness: 90, astQuality: 93 },
  { slug: "kyzylorda", name: "Кызылординская", short: "KYZ", resistance: 25.2, isolates: 1019, mdr: 8.1, delta: 1.3, labs: 4, completeness: 89, astQuality: 91 },
  { slug: "mangystau", name: "Мангистауская", short: "MAN", resistance: 23.4, isolates: 744, mdr: 7.8, delta: 1.1, labs: 3, completeness: 84, astQuality: 88 },
  { slug: "pavlodar", name: "Павлодарская", short: "PAV", resistance: 24.2, isolates: 1170, mdr: 7.3, delta: -0.9, labs: 4, completeness: 90, astQuality: 93 },
  { slug: "north-kazakhstan", name: "Северо-Казахстанская", short: "SKO", resistance: 20.8, isolates: 836, mdr: 6.4, delta: 0.5, labs: 3, completeness: 73, astQuality: 79 },
  { slug: "turkistan", name: "Туркестанская", short: "TUR", resistance: 28.4, isolates: 1468, mdr: 9.4, delta: 2.2, labs: 5, completeness: 91, astQuality: 93 },
  { slug: "ulytau", name: "Улытауская", short: "ULT", resistance: 27.1, isolates: 612, mdr: 9.2, delta: 2.8, labs: 2, completeness: 82, astQuality: 86 },
];

export function getRegionBySlug(slug: string) {
  return regions.find((region) => region.slug === slug);
}

export function getRegionByName(name: string) {
  return regions.find((region) => region.name === name);
}

export function slugForRegion(name: string) {
  return getRegionByName(name)?.slug ?? "astana";
}

export function regionTrend(region: RegionProfile) {
  const end = region.resistance;
  const step = region.delta / 3;
  return [
    end - region.delta - 2.1,
    end - region.delta - 1.4,
    end - region.delta - 0.8,
    end - region.delta,
    end - step * 2,
    end - step,
    end,
  ].map((value) => Number(Math.max(3, value).toFixed(1)));
}

export function regionOrganisms(region: RegionProfile) {
  const base = region.resistance;
  return [
    { name: "Klebsiella pneumoniae", code: "kpn", value: Math.min(78, base + 11.8), phenotype: "ESBL / CRE" },
    { name: "Acinetobacter baumannii", code: "aba", value: Math.min(82, base + 15.2), phenotype: "MDR" },
    { name: "Escherichia coli", code: "eco", value: Math.max(8, base - 1.2), phenotype: "ESBL" },
    { name: "Pseudomonas aeruginosa", code: "pae", value: Math.min(70, base + 3.7), phenotype: "MDR" },
    { name: "Staphylococcus aureus", code: "sau", value: Math.max(6, base - 7.4), phenotype: "MRSA" },
  ].map((item) => ({ ...item, value: Number(item.value.toFixed(1)) }));
}

export function regionAntibiotics(region: RegionProfile) {
  const base = region.resistance;
  return [
    { code: "AMP", name: "Ампициллин", value: Math.min(88, base + 35.5), aware: "Access" },
    { code: "CIP", name: "Ципрофлоксацин", value: Math.min(76, base + 5.1), aware: "Watch" },
    { code: "CRO", name: "Цефтриаксон", value: Math.min(75, base + 1.8), aware: "Watch" },
    { code: "SXT", name: "Триметоприм/сульфаметоксазол", value: Math.min(72, base + 3.4), aware: "Access" },
    { code: "MEM", name: "Меропенем", value: Math.max(0.4, region.mdr / 7), aware: "Watch" },
  ].map((item) => ({ ...item, value: Number(item.value.toFixed(1)) }));
}

export function regionMaterials(region: RegionProfile) {
  const shift = Math.round(region.resistance) % 5;
  return [
    { name: "Моча", value: 42 - shift },
    { name: "Кровь", value: 22 + shift },
    { name: "Респираторный", value: 17 },
    { name: "Раны", value: 12 },
    { name: "Прочие", value: 7 },
  ];
}
