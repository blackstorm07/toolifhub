import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tool from '@/models/Tool';
import { verifyApiAuth } from '@/lib/auth';

function requireAdmin(request) {
  const session = verifyApiAuth(request);
  if (!session || session.role !== 'admin') return null;
  return session;
}

export async function GET(request, { params }) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await connectDB();
    const { id } = await params;
    const tool = await Tool.findById(id).populate('category', 'name slug').lean();
    if (!tool) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ tool });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const tool = await Tool.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!tool) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ tool });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await connectDB();
    const { id } = await params;
    const tool = await Tool.findByIdAndDelete(id);
    if (!tool) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
