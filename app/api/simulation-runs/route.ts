import { NextRequest, NextResponse } from 'next/server';
import { db, COLLECTIONS, docToData } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');
    const scenarioId = searchParams.get('scenario_id');

    const runsRef = collection(db, COLLECTIONS.SIMULATION_RUNS);
    let runs: any[] = [];

    // If we have filters, fetch all and filter/sort in memory to avoid index requirements
    if (clientId || scenarioId) {
      const snapshot = await getDocs(runsRef);
      runs = snapshot.docs
        .map(doc => docToData(doc))
        .filter((r: any) => {
          if (clientId && r.client_id !== clientId) return false;
          if (scenarioId && r.scenario_id !== scenarioId) return false;
          return true;
        })
        .sort((a: any, b: any) => {
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          return dateB - dateA; // Descending
        });
    } else {
      // No filters, try to use orderBy directly
      try {
        const q = query(runsRef, orderBy('created_at', 'desc'));
        const snapshot = await getDocs(q);
        runs = snapshot.docs.map(doc => docToData(doc));
      } catch (error: any) {
        // If index doesn't exist, fetch all and sort in memory
        if (error.code === 'failed-precondition') {
          const snapshot = await getDocs(runsRef);
          runs = snapshot.docs
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

    return NextResponse.json(runs);
  } catch (error: any) {
    console.error('Error fetching simulation runs:', error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
