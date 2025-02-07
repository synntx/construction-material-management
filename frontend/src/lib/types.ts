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
