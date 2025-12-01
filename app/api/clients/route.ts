import { NextRequest, NextResponse } from 'next/server';
import { db, COLLECTIONS, createTimestamp, docToData } from '@/lib/firebase';
import { collection, getDocs, addDoc, orderBy, query } from 'firebase/firestore';

export async function GET() {
  try {
    console.log('Fetching clients from Firebase...');
    const clientsRef = collection(db, COLLECTIONS.CLIENTS);
    const q = query(clientsRef, orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    
    const clients = snapshot.docs.map(doc => docToData(doc));
    
    console.log('Successfully fetched clients:', clients.length);
    return NextResponse.json(clients);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const clientsRef = collection(db, COLLECTIONS.CLIENTS);
    const newClient = {
      name: body.name,
      industry: body.industry || '',
      description: body.description || '',
      tone_of_voice: body.tone_of_voice || '',
      products_or_services: body.products_or_services || '',
      policies: body.policies || '',
      extra_context: body.extra_context || '',
      base_system_prompt: body.base_system_prompt || '',
      created_at: createTimestamp(),
      updated_at: createTimestamp(),
    };

    const docRef = await addDoc(clientsRef, newClient);
    const client = { id: docRef.id, ...newClient, created_at: newClient.created_at.toDate().toISOString(), updated_at: newClient.updated_at.toDate().toISOString() };

    return NextResponse.json(client);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
