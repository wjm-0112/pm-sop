import { db } from '@/db/index';
import { createCrud } from './crud';
import type { Milestone } from '@/lib/types';

export const milestoneOps = createCrud<Milestone>(db.milestones);
