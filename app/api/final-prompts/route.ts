import { NextRequest, NextResponse } from 'next/server';
import { db, COLLECTIONS, docToData } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');

    const promptsRef = collection(db, COLLECTIONS.FINAL_PROMPT_SUGGESTIONS);
    let prompts: any[] = [];

    if (clientId) {
      // When filtering by client_id, fetch all and filter/sort in memory to avoid index requirement
      const snapshot = await getDocs(promptsRef);
      prompts = snapshot.docs
        .map(doc => docToData(doc))
        .filter((p: any) => p.client_id === clientId)
        .sort((a: any, b: any) => {
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          return dateB - dateA; // Descending
        });
    } else {
      // When no filter, we can use orderBy directly
      try {
        const q = query(promptsRef, orderBy('created_at', 'desc'));
        const snapshot = await getDocs(q);
        prompts = snapshot.docs.map(doc => docToData(doc));
      } catch (error: any) {
        // If index doesn't exist, fetch all and sort in memory
        if (error.code === 'failed-precondition') {
          const snapshot = await getDocs(promptsRef);
          prompts = snapshot.docs
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

    return NextResponse.json(prompts);
  } catch (error: any) {
    console.error('Error fetching final prompts:', error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
