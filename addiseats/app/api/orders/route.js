import { NextResponse } from "next/server";
import { createOrder, getOrdersForUser, IdempotencyConflictError } from "../../../lib/orders";
import { getDish } from "../../../lib/data";
import { DELIVERY_ORIGIN, getDeliveryLocation } from "../../../lib/delivery-locations";
import { orderSchema } from "../../../lib/orderSchema";
import { getSession } from "../../../lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(
    { orders: getOrdersForUser(session.id) },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}

export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const idempotencyKey = request.headers.get("idempotency-key");
  if (!idempotencyKey || !/^[A-Za-z0-9._:-]{8,128}$/.test(idempotencyKey)) {
    return NextResponse.json({ error: "A valid Idempotency-Key header is required." }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const result = orderSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const deliveryLocation = getDeliveryLocation(result.data.neighborhood);
  if (!deliveryLocation) {
    return NextResponse.json(
      { error: "Choose a delivery area from the available locations." },
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

  try {
    const order = createOrder({
      ...result.data,
      items,
      deliveryCoordinates: deliveryLocation,
      originCoordinates: DELIVERY_ORIGIN,
      userId: session.id
    }, idempotencyKey);

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    if (error instanceof IdempotencyConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}