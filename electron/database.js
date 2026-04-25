import pkg from './generated/client/index.js';
const { PrismaClient } = pkg;
import path from 'path';
import { app } from 'electron';
import Database from 'better-sqlite3';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

// Store DB in the writable user data directory
const dbPath = path.join(app.getPath('userData'), 'hermes.db');

// Use Driver Adapter for better performance and Electron compatibility
const db = new Database(dbPath);
const adapter = new PrismaBetterSqlite3(db);
const prisma = new PrismaClient({ adapter });

export async function getChats() {
  return prisma.chat.findMany({
    include: { messages: { orderBy: { timestamp: 'asc' } } },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getChat(id) {
  return prisma.chat.findUnique({
    where: { id },
    include: { messages: { orderBy: { timestamp: 'asc' } } }
  });
}

export async function createChat(id, title, agent) {
  return prisma.chat.create({
    data: { id, title, agent }
  });
}

export async function addMessage(id, chatId, role, content, agent, model) {
  return prisma.message.create({
    data: { id, chatId, role, content, agent, model }
  });
}

export async function getMemoryEntries() {
  return prisma.memoryEntry.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function createMemoryEntry(id, key, value, source, tags, pinned) {
  return prisma.memoryEntry.create({
    data: { id, key, value, source, tags: JSON.stringify(tags), pinned }
  });
}

export async function updateMemoryEntry(id, data) {
  return prisma.memoryEntry.update({ where: { id }, data });
}

export async function deleteMemoryEntry(id) {
  return prisma.memoryEntry.delete({ where: { id } });
}

export async function getTerminalHistory() {
  return prisma.terminalHistory.findMany({ orderBy: { timestamp: 'desc' } });
}

export async function addTerminalHistory(command, output) {
  return prisma.terminalHistory.create({
    data: { command, output }
  });
}

export async function getSetting(key) {
  const setting = await prisma.setting.findUnique({ where: { key } });
  return setting ? setting.value : null;
}

export async function setSetting(key, value) {
  return prisma.setting.upsert({
    where: { key },
    update: { value, updatedAt: new Date() },
    create: { key, value }
  });
}

export { prisma };
