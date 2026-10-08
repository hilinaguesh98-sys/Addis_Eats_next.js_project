import { NextResponse } from "next/server";
import { createOrder, getOrdersForUser } from "../../../lib/orders";
import { getDish } from "../../../lib/data";
import { orderSchema } from "../../../lib/orderSchema";
import { getSession } from "../../../lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ orders: getOrdersForUser(session.id) });
}

export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();

    const result = orderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const items = result.data.items;

    for (const item of items) {
      if (!getDish(item.id)) {
        return NextResponse.json(
          { error: "Invalid item" },
          { status: 400 }
        );
      }
    }

    const order = createOrder({
      ...result.data,
      items,
      userId: session.id
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}