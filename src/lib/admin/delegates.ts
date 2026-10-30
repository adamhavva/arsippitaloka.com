import { prisma } from "@/lib/prisma";

/**
 * Delegate Prisma untuk entitas admin, dibungkus tipe longgar supaya
 * CRUD generik bisa memanggil semuanya tanpa unions yang monstrous.
 * Daftar entitasnya sudah dibatasi (allowlist) di `entities.ts`.
 */
export type LooseDelegate = {
  findMany(args?: any): Promise<any[]>;
  findFirst(args?: any): Promise<any>;
  findUnique(args: any): Promise<any>;
  create(args: any): Promise<any>;
  update(args: any): Promise<any>;
  delete(args: any): Promise<any>;
  count(args?: any): Promise<number>;
};

export const DELEGATES: Record<string, LooseDelegate> = {
  category: prisma.category as unknown as LooseDelegate,
  contentTab: prisma.contentTab as unknown as LooseDelegate,
  book: prisma.book as unknown as LooseDelegate,
  documentation: prisma.documentation as unknown as LooseDelegate,
  tiktokPost: prisma.tiktokPost as unknown as LooseDelegate,
};

export function getDelegate(model: string): LooseDelegate | undefined {
  return DELEGATES[model];
}
