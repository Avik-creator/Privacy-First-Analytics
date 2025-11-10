import { loadChat } from '@/lib/chat-store';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    const messages = await loadChat(chatId);
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error loading chat:', error);
    return NextResponse.json(
      { error: 'Failed to load chat' },
      { status: 500 }
    );
  }
}

