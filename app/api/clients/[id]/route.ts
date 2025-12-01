import { NextRequest, NextResponse } from 'next/server';
import { db, COLLECTIONS, createTimestamp, docToData } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id;
    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    const clientRef = doc(db, COLLECTIONS.CLIENTS, clientId);
    const clientSnap = await getDoc(clientRef);

    if (!clientSnap.exists()) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const client = docToData(clientSnap);
    if (!client) {
      return NextResponse.json({ error: 'Failed to parse client data' }, { status: 500 });
    }

    return NextResponse.json(client);
  } catch (error: any) {
    console.error('Error fetching client:', error);
    return NextResponse.json({ 
      error: error?.message || String(error) || 'Internal server error' 
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id;
    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const clientRef = doc(db, COLLECTIONS.CLIENTS, clientId);

    await updateDoc(clientRef, {
      name: body.name,
      industry: body.industry,
      description: body.description,
      tone_of_voice: body.tone_of_voice,
      products_or_services: body.products_or_services,
      policies: body.policies,
      extra_context: body.extra_context,
      base_system_prompt: body.base_system_prompt,
      updated_at: createTimestamp(),
    });

    const updatedSnap = await getDoc(clientRef);
    const client = docToData(updatedSnap);

    return NextResponse.json(client);
  } catch (error: any) {
    console.error('Error updating client:', error);
    return NextResponse.json({ 
      error: error?.message || String(error) || 'Internal server error' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id;
    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    const clientRef = doc(db, COLLECTIONS.CLIENTS, clientId);
    await deleteDoc(clientRef);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting client:', error);
    return NextResponse.json({ 
      error: error?.message || String(error) || 'Internal server error' 
    }, { status: 500 });
  }
}
