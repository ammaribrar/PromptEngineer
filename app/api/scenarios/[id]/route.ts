import { NextRequest, NextResponse } from 'next/server';
import { db, COLLECTIONS, docToData } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const scenarioRef = doc(db, COLLECTIONS.SCENARIOS, params.id);

    await updateDoc(scenarioRef, {
      name: body.name,
      type: body.type,
      description: body.description,
      customer_persona: body.customer_persona,
      goal: body.goal,
      message_count: body.message_count,
      is_active: body.is_active,
    });

    const updatedSnap = await getDoc(scenarioRef);
    const scenario = docToData(updatedSnap);

    return NextResponse.json(scenario);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scenarioRef = doc(db, COLLECTIONS.SCENARIOS, params.id);
    await deleteDoc(scenarioRef);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
