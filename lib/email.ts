import nodemailer from "nodemailer";
import { db } from "@/db/drizzle";
import { ordersTable, productsTable, systemSettingsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatPrice } from "@/lib/utils";
import { getAdminEmails } from "@/lib/auth";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Creates and returns a Nodemailer transporter configured from environment variables.
 */
function createTransporter() {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || "587");
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = (process.env.SMTP_USER || process.env.EMAIL_USER)?.trim();
  const rawPass = (process.env.SMTP_PASS || process.env.EMAIL_PASS)?.trim();
  const pass = rawPass?.replace(/\s+/g, "");

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Sends an email using Nodemailer.
 */
export async function sendEmail({ to, subject, html, replyTo }: EmailPayload): Promise<{ success: boolean; id?: string; error?: string }> {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const defaultFrom = user ? `Elvara Floral Atelier <${user}>` : "Elvara Floral Atelier <orders@elvaraflorist.com>";
  const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_FROM || defaultFrom;

  const transporter = createTransporter();

  // If SMTP credentials are not configured yet, log safely to console
  if (!transporter) {
    console.log("=================================================");
    console.log("[Nodemailer] SMTP credentials (SMTP_USER & SMTP_PASS) not set in .env.");
    console.log(`[Nodemailer Simulated] To: ${to}`);
    console.log(`[Nodemailer Simulated] Subject: ${subject}`);
    console.log("To deliver live emails, please configure SMTP_USER and SMTP_PASS in .env");
    console.log("=================================================");
    return { success: true, id: "simulated_nodemailer_log" };
  }

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
      replyTo,
    });

    console.log(`[Nodemailer] Message sent to ${to}: ${info.messageId}`);
    return { success: true, id: info.messageId };
  } catch (error: any) {
    console.error("[Nodemailer] Failed to send email:", error);
    return { success: false, error: error?.message || "Nodemailer dispatch error" };
  }
}

/**
 * Generates an elegant HTML receipt for the Customer
 */
function buildCustomerReceiptHtml(params: {
  orderId: string;
  paymentId?: string | null;
  customerName: string;
  productTitle: string;
  productPrice: number;
  deliveryFee: number;
  giftFee: number;
  totalAmount: number;
  fulfillmentType: string;
  shippingAddress?: string | null;
  city?: string | null;
  postalCode?: string | null;
  deliveryNotes?: string | null;
  pickupAddress: string;
  pickupHours: string;
  isGift: boolean;
  giftCardType?: string | null;
  giftMessage?: string | null;
}): string {
  const isPickup = params.fulfillmentType === "pickup";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - Elvara Floral Atelier</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf9f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #262626;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #faf9f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e7e5e4; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 36px 36px 28px 36px; background-color: #1c1917; text-align: center;">
              <span style="font-size: 28px;">🌸</span>
              <h1 style="margin: 10px 0 0 0; color: #fafaf9; font-size: 22px; font-weight: 500; letter-spacing: 1px; font-family: Georgia, serif;">
                ELVARA
              </h1>
              <p style="margin: 4px 0 0 0; color: #a8a29e; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">
                Floral Atelier & Botanical Studio
              </p>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 36px 36px 24px 36px;">
              <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 600; color: #1c1917; font-family: Georgia, serif;">
                Thank you for your order, ${params.customerName}!
              </h2>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #57534e;">
                Your botanical arrangement is confirmed. Our floral artisans are preparing your blooms with the utmost care.
              </p>

              <!-- Order Summary Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e7e5e4;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size: 12px; color: #78716c; text-transform: uppercase; letter-spacing: 0.5px;">Order Reference</td>
                        <td align="right" style="font-size: 12px; color: #78716c; text-transform: uppercase; letter-spacing: 0.5px;">Status</td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; font-weight: 600; color: #1c1917; font-family: monospace; padding-top: 4px;">${params.orderId}</td>
                        <td align="right" style="font-size: 12px; font-weight: 600; color: #047857; padding-top: 4px;">✓ Confirmed & Paid</td>
                      </tr>
                      ${params.paymentId ? `
                      <tr>
                        <td colspan="2" style="font-size: 11px; color: #a8a29e; padding-top: 4px;">Payment ID: ${params.paymentId}</td>
                      </tr>` : ""}
                    </table>
                  </td>
                </tr>

                <!-- Item Row -->
                <tr>
                  <td style="padding: 16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size: 14px; font-weight: 500; color: #1c1917;">
                          ${params.productTitle}
                        </td>
                        <td align="right" style="font-size: 14px; font-weight: 600; color: #1c1917;">
                          ${formatPrice(params.productPrice)}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #78716c; padding-top: 8px;">
                          ${isPickup ? "Studio Collection (Jubilee Hills)" : "Courier Doorstep Delivery"}
                        </td>
                        <td align="right" style="font-size: 12px; color: #1c1917; padding-top: 8px;">
                          ${isPickup ? "FREE" : formatPrice(params.deliveryFee)}
                        </td>
                      </tr>
                      ${params.isGift ? `
                      <tr>
                        <td style="font-size: 12px; color: #9f1239; padding-top: 8px;">
                          Bespoke Gift Wrap & Handcrafted Card
                        </td>
                        <td align="right" style="font-size: 12px; color: #9f1239; padding-top: 8px;">
                          +${formatPrice(params.giftFee)}
                        </td>
                      </tr>` : ""}
                      <tr>
                        <td colspan="2" style="padding-top: 14px; border-bottom: 1px solid #e7e5e4;"></td>
                      </tr>
                      <tr>
                        <td style="font-size: 15px; font-weight: 600; color: #1c1917; padding-top: 14px; font-family: Georgia, serif;">
                          Total Paid
                        </td>
                        <td align="right" style="font-size: 17px; font-weight: 700; color: #1c1917; padding-top: 14px;">
                          ${formatPrice(params.totalAmount)}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Fulfillment Details Section -->
              <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600; color: #1c1917; text-transform: uppercase; letter-spacing: 0.5px;">
                ${isPickup ? "Collection Studio Information" : "Delivery Details"}
              </h3>
              
              <div style="background-color: #fafaf9; border-radius: 12px; border: 1px solid #e7e5e4; padding: 16px 20px; margin-bottom: 24px; font-size: 13px; line-height: 1.5; color: #44403c;">
                ${isPickup ? `
                  <p style="margin: 0 0 6px 0;"><strong>Atelier Location:</strong> ${params.pickupAddress}</p>
                  <p style="margin: 0 0 6px 0;"><strong>Studio Hours:</strong> ${params.pickupHours}</p>
                  <p style="margin: 0; color: #78716c; font-size: 12px; font-style: italic;">
                    Please present Order ID <strong>${params.orderId}</strong> at the front desk when picking up your flowers.
                  </p>
                ` : `
                  <p style="margin: 0 0 4px 0;"><strong>Recipient:</strong> ${params.customerName}</p>
                  <p style="margin: 0 0 4px 0;"><strong>Address:</strong> ${params.shippingAddress || "As specified"}</p>
                  <p style="margin: 0 0 6px 0;"><strong>City:</strong> ${params.city || "Hyderabad"} ${params.postalCode ? ` - ${params.postalCode}` : ""}</p>
                  ${params.deliveryNotes ? `<p style="margin: 0; color: #78716c; font-size: 12px;"><strong>Instructions:</strong> ${params.deliveryNotes}</p>` : ""}
                `}
              </div>

              ${params.isGift && params.giftMessage ? `
              <!-- Gift Message Note -->
              <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600; color: #9f1239; text-transform: uppercase; letter-spacing: 0.5px;">
                Handwritten Card Note
              </h3>
              <div style="background-color: #fff1f2; border-radius: 12px; border: 1px solid #fecdd3; padding: 16px 20px; margin-bottom: 24px; font-size: 13px; font-style: italic; color: #881337; line-height: 1.6; white-space: pre-wrap;">
                ${params.giftMessage}
              </div>
              ` : ""}

              <!-- Assistance Note -->
              <p style="margin: 0; font-size: 12px; color: #78716c; line-height: 1.6;">
                Have questions about your order or need custom scheduling? Reply directly to this email or reach us at <a href="mailto:studio@elvaraflorist.com" style="color: #1c1917; text-decoration: underline;">studio@elvaraflorist.com</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #f5f5f4; text-align: center; border-top: 1px solid #e7e5e4;">
              <p style="margin: 0; font-size: 11px; color: #a8a29e;">
                Elvara Floral Atelier • Handcrafted fresh botanicals & bespoke arrangements
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generates an actionable notification HTML for the Atelier Owner / Admin
 */
function buildOwnerAlertHtml(params: {
  orderId: string;
  paymentId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  productTitle: string;
  totalAmount: number;
  fulfillmentType: string;
  shippingAddress?: string | null;
  city?: string | null;
  postalCode?: string | null;
  deliveryNotes?: string | null;
  isGift: boolean;
  giftCardType?: string | null;
  giftMessage?: string | null;
}): string {
  const isPickup = params.fulfillmentType === "pickup";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Order Alert - Elvara Atelier</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e4e4e7;">
          
          <!-- Banner -->
          <tr>
            <td style="padding: 24px 30px; background-color: #18181b; color: #ffffff;">
              <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #a1a1aa; font-weight: 600;">
                Elvara Atelier CMS
              </span>
              <h1 style="margin: 6px 0 0 0; font-size: 20px; font-weight: 600; font-family: Georgia, serif;">
                🌸 New Order Placed: ${formatPrice(params.totalAmount)}
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 28px 30px;">
              
              <!-- Quick Overview -->
              <table width="100%" cellpadding="8" cellspacing="0" style="margin-bottom: 24px; border-collapse: collapse; font-size: 13px;">
                <tr style="border-bottom: 1px solid #f4f4f5;">
                  <td style="color: #71717a; width: 140px;">Order ID</td>
                  <td style="font-weight: 600; font-family: monospace;">${params.orderId}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f4f4f5;">
                  <td style="color: #71717a;">Payment ID</td>
                  <td style="font-family: monospace;">${params.paymentId || "Verified Razorpay / Demo"}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f4f4f5;">
                  <td style="color: #71717a;">Product</td>
                  <td style="font-weight: 600; color: #09090b;">${params.productTitle}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f4f4f5;">
                  <td style="color: #71717a;">Fulfillment</td>
                  <td>
                    <span style="display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; background-color: ${isPickup ? "#ecfdf5; color: #047857;" : "#eff6ff; color: #1d4ed8;"}">
                      ${isPickup ? "STUDIO PICKUP (JUBILEE HILLS)" : "COURIER DELIVERY"}
                    </span>
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #f4f4f5;">
                  <td style="color: #71717a;">Total Paid</td>
                  <td style="font-size: 15px; font-weight: 700; color: #09090b;">${formatPrice(params.totalAmount)}</td>
                </tr>
              </table>

              <!-- Customer Details Card -->
              <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px;">
                Customer & Contact
              </h3>
              <div style="background-color: #fbfbfa; border: 1px solid #e4e4e7; border-radius: 10px; padding: 14px 18px; margin-bottom: 20px; font-size: 13px; line-height: 1.6;">
                <div><strong>Name:</strong> ${params.customerName}</div>
                <div><strong>Email:</strong> <a href="mailto:${params.customerEmail}" style="color: #18181b;">${params.customerEmail}</a></div>
                <div><strong>Phone:</strong> <a href="tel:${params.customerPhone || ""}" style="color: #18181b;">${params.customerPhone || "Not provided"}</a></div>
              </div>

              <!-- Fulfillment Specifics -->
              <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px;">
                ${isPickup ? "Pickup Instructions" : "Delivery Address & Instructions"}
              </h3>
              <div style="background-color: #fbfbfa; border: 1px solid #e4e4e7; border-radius: 10px; padding: 14px 18px; margin-bottom: 20px; font-size: 13px; line-height: 1.6;">
                ${isPickup ? `
                  <div>Customer requested atelier collection at the Jubilee Hills Studio.</div>
                  ${params.deliveryNotes ? `<div style="margin-top: 6px;"><strong>Collection Notes:</strong> ${params.deliveryNotes}</div>` : ""}
                ` : `
                  <div><strong>Address:</strong> ${params.shippingAddress || "Not provided"}</div>
                  <div><strong>City / PIN:</strong> ${params.city || ""} ${params.postalCode ? `(${params.postalCode})` : ""}</div>
                  ${params.deliveryNotes ? `<div style="margin-top: 6px;"><strong>Delivery Notes:</strong> ${params.deliveryNotes}</div>` : ""}
                `}
              </div>

              <!-- Gift Packaging & Note -->
              ${params.isGift ? `
              <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 600; color: #9f1239; text-transform: uppercase; letter-spacing: 0.5px;">
                Bespoke Gift Package (Requires Physical Card Printing)
              </h3>
              <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px; font-size: 13px; color: #881337; line-height: 1.6;">
                <div><strong>Card Style:</strong> ${params.giftCardType || "vintage-botanical"}</div>
                <div style="margin-top: 8px; font-style: italic; white-space: pre-wrap; background: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #ffe4e6;">
                  ${params.giftMessage || "No custom message provided"}
                </div>
              </div>
              ` : ""}

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 30px; background-color: #f4f4f5; text-align: center; border-top: 1px solid #e4e4e7; font-size: 11px; color: #71717a;">
              To view, update fulfillment status, or print packing slips, log into the Elvara Florist Admin Dashboard.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Triggers order notification emails via Nodemailer to both Customer and Store Owner.
 */
export async function sendOrderNotificationEmails(orderId: string): Promise<void> {
  try {
    // 1. Fetch order details from database
    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId))
      .limit(1);

    if (!order) {
      console.error(`[Nodemailer] Could not find order ${orderId} to dispatch emails.`);
      return;
    }

    // 2. Fetch product details
    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, order.postId))
      .limit(1);

    const productTitle = product?.title || "Botanical Floral Arrangement";
    const productPrice = product?.price ? parseFloat(product.price) : 0;
    const deliveryFee = order.deliveryFee ? parseFloat(order.deliveryFee) : 0;
    const giftFee = order.giftFee ? parseFloat(order.giftFee) : 0;
    const totalAmount = order.amount ? parseFloat(order.amount) : productPrice + deliveryFee + giftFee;

    // 3. Fetch atelier settings
    const settings = await db.select().from(systemSettingsTable);
    const settingsMap: Record<string, string> = {
      pickup_address: "Elvara Floral Atelier, Road No. 36, Jubilee Hills, Hyderabad 500033",
      pickup_hours: "Monday – Sunday, 09:00 AM – 08:00 PM",
    };
    for (const item of settings) {
      settingsMap[item.key] = item.value;
    }

    const customerEmail = order.customerEmail;
    const customerName = order.customerName || "Valued Customer";

    // 4. Send Customer Confirmation Email (if customerEmail exists)
    if (customerEmail) {
      const customerHtml = buildCustomerReceiptHtml({
        orderId: order.id,
        paymentId: order.paymentId,
        customerName,
        productTitle,
        productPrice,
        deliveryFee,
        giftFee,
        totalAmount,
        fulfillmentType: order.fulfillmentType,
        shippingAddress: order.shippingAddress,
        city: order.city,
        postalCode: order.postalCode,
        deliveryNotes: order.deliveryNotes,
        pickupAddress: settingsMap["pickup_address"],
        pickupHours: settingsMap["pickup_hours"],
        isGift: order.isGift,
        giftCardType: order.giftCardType,
        giftMessage: order.giftMessage,
      });

      await sendEmail({
        to: customerEmail,
        subject: `Your Elvara Floral Order is Confirmed (${order.id})`,
        html: customerHtml,
      });
    }

    // 5. Send Owner / Admin Alert Email
    const adminEmails = getAdminEmails();
    const ownerEmail = process.env.OWNER_EMAIL || adminEmails[0] || "admin@gmail.com";

    if (ownerEmail) {
      const ownerHtml = buildOwnerAlertHtml({
        orderId: order.id,
        paymentId: order.paymentId,
        customerName,
        customerEmail: customerEmail || "Not provided",
        customerPhone: order.customerPhone,
        productTitle,
        totalAmount,
        fulfillmentType: order.fulfillmentType,
        shippingAddress: order.shippingAddress,
        city: order.city,
        postalCode: order.postalCode,
        deliveryNotes: order.deliveryNotes,
        isGift: order.isGift,
        giftCardType: order.giftCardType,
        giftMessage: order.giftMessage,
      });

      await sendEmail({
        to: ownerEmail,
        subject: `🌸 New Order Placed: ${productTitle} (${formatPrice(totalAmount)})`,
        html: ownerHtml,
        replyTo: customerEmail || undefined,
      });
    }
  } catch (error: any) {
    console.error("[Nodemailer] Error dispatching order notification emails:", error);
  }
}

