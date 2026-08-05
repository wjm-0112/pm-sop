import { db } from '@/db/index';
import { createCrud } from './crud';
import type { Competitor } from '@/lib/types';

export const competitorOps = createCrud<Competitor>(db.competitors);
