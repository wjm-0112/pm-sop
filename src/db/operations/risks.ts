import { db } from '@/db/index';
import { createCrud } from './crud';
import type { Risk } from '@/lib/types';

export const riskOps = createCrud<Risk>(db.risks);
