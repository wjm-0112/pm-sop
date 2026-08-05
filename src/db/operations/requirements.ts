import { db } from '@/db/index';
import { createCrud } from './crud';
import type { Requirement } from '@/lib/types';

export const requirementOps = createCrud<Requirement>(db.requirements);

export async function getRequirementsByVersion(versionId: string): Promise<Requirement[]> {
  return db.requirements.where('versionId').equals(versionId).toArray();
}

export async function getChildRequirements(parentId: string): Promise<Requirement[]> {
  return db.requirements.where('parentId').equals(parentId).toArray();
}
