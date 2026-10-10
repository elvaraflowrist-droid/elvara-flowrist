import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("Applying gift and fulfillment columns to orders table...");
  await sql`
    ALTER TABLE orders 
    ADD COLUMN IF NOT EXISTS fulfillment_type text NOT NULL DEFAULT 'delivery',
    ADD COLUMN IF NOT EXISTS is_gift boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS gift_card_type text,
    ADD COLUMN IF NOT EXISTS gift_message text,
    ADD COLUMN IF NOT EXISTS delivery_fee numeric(10, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS gift_fee numeric(10, 2) DEFAULT 0;
  `;
  console.log("Columns successfully applied to orders table!");

  console.log("Ensuring system_settings table exists...");
  await sql`
    CREATE TABLE IF NOT EXISTS system_settings (
      key text PRIMARY KEY,
      value text NOT NULL,
      updated_at timestamp DEFAULT now() NOT NULL
    );
  `;

  console.log("Checking and seeding default settings if not present...");
  await sql`
    INSERT INTO system_settings (key, value, updated_at)
    VALUES 
      ('delivery_fee', '15.00', now()),
      ('gift_price', '12.00', now()),
      ('pickup_address', 'Elvara Floral Atelier, Road No. 36, Jubilee Hills, Hyderabad 500033', now()),
      ('pickup_hours', 'Monday – Sunday, 09:00 AM – 08:00 PM', now())
    ON CONFLICT (key) DO NOTHING;
  `;

  const settings = await sql`SELECT * FROM system_settings;`;
  console.log("Current system settings:", settings);
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
