import { NextRequest, NextResponse } from 'next/server';
import { db, COLLECTIONS, createTimestamp, docToData } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, where, orderBy } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');

    const scenariosRef = collection(db, COLLECTIONS.SCENARIOS);
    let scenarios: any[] = [];

    if (clientId) {
      // When filtering by client_id, fetch all and filter/sort in memory to avoid index requirement
      const snapshot = await getDocs(scenariosRef);
      scenarios = snapshot.docs
        .map(doc => docToData(doc))
        .filter((s: any) => s.client_id === clientId)
        .sort((a: any, b: any) => {
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          return dateB - dateA; // Descending
        });
    } else {
      // When no filter, we can use orderBy directly
      try {
        const q = query(scenariosRef, orderBy('created_at', 'desc'));
        const snapshot = await getDocs(q);
        scenarios = snapshot.docs.map(doc => docToData(doc));
      } catch (error: any) {
        // If index doesn't exist, fetch all and sort in memory
        if (error.code === 'failed-precondition') {
          const snapshot = await getDocs(scenariosRef);
          scenarios = snapshot.docs
            .map(doc => docToData(doc))
            .sort((a: any, b: any) => {
              const dateA = new Date(a.created_at || 0).getTime();
              const dateB = new Date(b.created_at || 0).getTime();
              return dateB - dateA;
            });
        } else {
          throw error;
        }
      }
    }

    return NextResponse.json(scenarios);
  } catch (error: any) {
    console.error('Error fetching scenarios:', error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const scenariosRef = collection(db, COLLECTIONS.SCENARIOS);
    const newScenario = {
      client_id: body.client_id,
      name: body.name,
      type: body.type || 'general',
      description: body.description || '',
      customer_persona: body.customer_persona || '',
      goal: body.goal || '',
      message_count: body.message_count || 8,
      is_active: body.is_active !== undefined ? body.is_active : true,
      created_at: createTimestamp(),
    };

    const docRef = await addDoc(scenariosRef, newScenario);
    const scenario = { id: docRef.id, ...newScenario, created_at: newScenario.created_at.toDate().toISOString() };

    return NextResponse.json(scenario);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
