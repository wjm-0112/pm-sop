import { db } from '@/db/index';
import { createCrud } from './crud';
import type { PRDDocument } from '@/lib/types';

export const prdOps = createCrud<PRDDocument>(db.prdDocuments);
