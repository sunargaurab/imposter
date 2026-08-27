import { NextResponse } from 'next/server';
import os from 'os';

export const dynamic = 'force-dynamic';

export async function GET() {
  let localIp = 'localhost';
  const interfaces = os.networkInterfaces();

  // Find non-internal IPv4 address (e.g. 192.168.x.x, 10.x.x.x, 172.x.x.x)
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIp = iface.address;
        break;
      }
    }
  }

  return NextResponse.json({ localIp });
}
