export interface Project {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BasicItem {
  id: number;
  projectId: string;
  code: string;
  name: string;
  unit: string;
  rate: string;
  avgLeadTime: number;
  subType: string;
  parentItemId: string | null;
  createdAt: string;
  updatedAt: string;
  childItems: BasicItem[] | [];
}

export const SubType = {
  CIVIL: "civil",
  OHE: "ohe",
  PWAY: "pway",
  STRUCTURAL_STEEL: "structural_steel",
  REINFORCEMENT_STEEL: "reinforcement_steel",
  ROOFING_SHEETS: "roofing_sheets",
  FLUSH_DOORS: "flush_doors",
  MECHANICAL: "mechanical",
} as const;

export type SubType = typeof SubType[keyof typeof SubType];

export const getSubTypeLabel = (type: SubType): string => {
  const labels: Record<SubType, string> = {
    civil: "Civil",
    ohe: "OHE",
    pway: "P-Way",
    structural_steel: "Structural Steel",
    reinforcement_steel: "Reinforcement Steel",
    roofing_sheets: "Roofing Sheets",
    flush_doors: "Flush Doors",
    mechanical: "Mechanical",
  };
  return labels[type];
};