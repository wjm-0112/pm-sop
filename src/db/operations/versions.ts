import { db } from '@/db/index';
import { createCrud } from './crud';
import type { Version } from '@/lib/types';

export const versionOps = createCrud<Version>(db.versions);
