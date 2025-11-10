import { saveChat } from '@/lib/chat-store';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { chatId } = await req.json();

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    // Save empty messages array to clear the chat
    await saveChat({ chatId, messages: [] });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing chat:', error);
    return NextResponse.json(
      { error: 'Failed to clear chat' },
      { status: 500 }
    );
  }
}

