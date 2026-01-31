import { NextRequest, NextResponse } from 'next/server';

const RPC_URL = 'https://rpc-testnet.iopn.io/';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const rpcResponse = await fetch(RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!rpcResponse.ok) {
        const error = await rpcResponse.text();
        return new NextResponse(error, { status: rpcResponse.status });
    }

    const data = await rpcResponse.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in RPC proxy:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
