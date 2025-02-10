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

export enum SubTypeEnum {
  civil = "civil",
  ohe = "ohe",
  pway = "pway",
  structural_steel = "structural_steel",
  reinforcement_steel = "reinforcement_steel",
  roofing_sheets = "roofing_sheets",
  flush_doors = "flush_doors",
  mechanical = "mechanical",
}