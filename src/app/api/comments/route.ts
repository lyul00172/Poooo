import db from '@/lib/db';
import { filterContent } from '@/lib/filter';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  
  if (!date) {
    return NextResponse.json({ error: 'Date is required' }, { status: 400 });
  }

  try {
    const stmt = db.prepare('SELECT * FROM comments WHERE date = ? ORDER BY created_at ASC');
    const comments = stmt.all(date);
    return NextResponse.json({ comments });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { date, nickname, content, password } = await request.json();

    if (!date || !nickname || !content) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const filteredContent = filterContent(content);

    const stmt = db.prepare('INSERT INTO comments (date, nickname, content, password) VALUES (?, ?, ?, ?)');
    const info = stmt.run(date, nickname, filteredContent, password || null);

    return NextResponse.json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id, password } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

    // Verify password
    const comment = db.prepare('SELECT password FROM comments WHERE id = ?').get(id) as any;
    
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (comment.password && comment.password !== password) {
      return NextResponse.json({ error: '비밀번호가 틀렸습니다.' }, { status: 403 });
    }

    db.prepare('DELETE FROM comments WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
