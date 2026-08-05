import { type Table, type UpdateSpec } from 'dexie';
import type { PMDatabase } from '@/db/index';
import { db } from '@/db/index';

// 通用 CRUD 工厂，避免每个实体重复样板代码
export function createCrud<T extends { id: string }>(table: Table<T, string>) {
  return {
    async getAll(): Promise<T[]> {
      return table.toArray();
    },
    async getById(id: string): Promise<T | undefined> {
      return table.get(id);
    },
    async add(item: T): Promise<string> {
      return table.add(item);
    },
    async bulkAdd(items: T[]): Promise<void> {
      await db.transaction('rw', table, async () => {
        await table.bulkAdd(items);
      });
    },
    async update(id: string, changes: Partial<T>): Promise<void> {
      await table.update(id, changes as UpdateSpec<T>);
    },
    async put(item: T): Promise<string> {
      return table.put(item);
    },
    async bulkPut(items: unknown[]): Promise<void> {
      await db.transaction('rw', table, async () => {
        await table.bulkPut(items as T[]);
      });
    },
    async remove(id: string): Promise<void> {
      await table.delete(id);
    },
    async clear(): Promise<void> {
      await table.clear();
    },
    async count(): Promise<number> {
      return table.count();
    },
  };
}

export type Crud<T extends { id: string }> = ReturnType<typeof createCrud<T>>;
export type { PMDatabase };
