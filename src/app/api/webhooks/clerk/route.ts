import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Clerk → DB sync. Configure this URL as a webhook endpoint in the Clerk
 * dashboard (events: user.created, user.updated, user.deleted) and set
 * CLERK_WEBHOOK_SIGNING_SECRET.
 */
export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    switch (evt.type) {
      case "user.created":
      case "user.updated": {
        const { id, email_addresses, primary_email_address_id, first_name, last_name, image_url } =
          evt.data;
        const email =
          email_addresses.find((e) => e.id === primary_email_address_id)
            ?.email_address ??
          email_addresses[0]?.email_address ??
          `${id}@no-email.local`;

        await prisma.user.upsert({
          where: { clerkId: id },
          update: {
            email,
            firstName: first_name,
            lastName: last_name,
            imageUrl: image_url,
          },
          create: {
            clerkId: id,
            email,
            firstName: first_name,
            lastName: last_name,
            imageUrl: image_url,
          },
        });
        break;
      }
      case "user.deleted": {
        if (evt.data.id) {
          await prisma.user
            .delete({ where: { clerkId: evt.data.id } })
            .catch(() => null);
        }
        break;
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Clerk webhook error:", err);
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }
}
