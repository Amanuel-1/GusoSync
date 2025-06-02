import { NextResponse } from 'next/server';
import { anbessaBusRoutes } from '@/data/busRoutes';

export async function GET() {
  return NextResponse.json(anbessaBusRoutes);
}
