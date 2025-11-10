import { UIMessage, generateId } from 'ai';
import { existsSync, mkdirSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const CHAT_DIR = path.join(process.cwd(), '.chats');

// Ensure chat directory exists
function ensureChatDir() {
  if (!existsSync(CHAT_DIR)) {
    mkdirSync(CHAT_DIR, { recursive: true });
  }
}

function getChatFile(id: string): string {
  ensureChatDir();
  return path.join(CHAT_DIR, `${id}.json`);
}

export async function createChat(): Promise<string> {
  const id = generateId(); // generate a unique chat ID
  await writeFile(getChatFile(id), '[]'); // create an empty chat file
  return id;
}

export async function loadChat(id: string): Promise<UIMessage[]> {
  try {
    const filePath = getChatFile(id);
    if (!existsSync(filePath)) {
      return [];
    }
    const content = await readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading chat:', error);
    return [];
  }
}

export async function saveChat({
  chatId,
  messages,
}: {
  chatId: string;
  messages: UIMessage[];
}): Promise<void> {
  try {
    const content = JSON.stringify(messages, null, 2);
    await writeFile(getChatFile(chatId), content);
  } catch (error) {
    console.error('Error saving chat:', error);
    throw error;
  }
}

export async function listChats(): Promise<{ id: string; lastModified: Date }[]> {
  try {
    ensureChatDir();
    const { readdirSync, statSync } = require('fs');
    const files = readdirSync(CHAT_DIR);

    return files
      .filter((file: string) => file.endsWith('.json'))
      .map((file: string) => {
        const id = file.replace('.json', '');
        const stats = statSync(path.join(CHAT_DIR, file));
        return {
          id,
          lastModified: stats.mtime,
        };
      })
      .sort((b: { lastModified: Date }, a: { lastModified: Date }) => b.lastModified.getTime() - a.lastModified.getTime());
  } catch (error) {
    console.error('Error listing chats:', error);
    return [];
  }
}

export async function deleteChat(id: string): Promise<void> {
  try {
    const { unlinkSync } = require('fs');
    const filePath = getChatFile(id);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting chat:', error);
    throw error;
  }
}

