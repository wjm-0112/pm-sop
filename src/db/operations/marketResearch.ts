import { db } from '@/db/index';
import { createCrud } from './crud';
import type { MarketResearch } from '@/lib/types';

export const marketResearchOps = createCrud<MarketResearch>(db.marketResearch);
