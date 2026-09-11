export type UnitType = 'kg' | 'piece' | 'box' | 'tray';

export type PaymentMethod = 'cash' | 'promptpay' | 'transfer' | 'credit';

export type PaymentStatus = 'paid' | 'pending' | 'partial';

export type CustomerType = 'retail' | 'wholesale' | 'regular';

export type ExpenseCategory = 'labor' | 'transport' | 'packaging' | 'stall_rent' | 'utilities' | 'other';

export type WasteType = 'spoilage' | 'damaged' | 'peel_loss' | 'grade_drop';

export type UserRole = 'worker' | 'super_admin';

export interface AppUser {
  id: string;
  name: string;
  username: string;
  pin: string;
  role: UserRole;
  avatar_emoji?: string;
  created_at: string;
}

export interface Season {
  id: string;
  name: string;
  year: number;
  start_date: string;
  end_date?: string | null;
  status: 'active' | 'closed';
  budget: number;
  notes?: string;
  created_at: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  icon_emoji?: string;
  created_at?: string;
}

export interface Product {
  id: string;
  sku?: string;          // รหัส SKU เช่น SKU-DUR-001
  barcode?: string;      // บาร์โค้ด (ถ้ามี)
  season_id?: string;
  name: string;
  category: string;
  unit_type: UnitType;
  price_per_unit: number; // ราคาขายต่อ กก. หรือต่อชิ้น
  cost_per_unit: number;  // ต้นทุนเฉลี่ยต่อ กก. หรือต่อชิ้น
  current_stock: number;  // สต็อกคงเหลือ (กก. หรือ ชิ้น)
  image_emoji: string;
  is_active: boolean;
  created_at?: string;
}

export interface InboundLot {
  id: string;
  season_id?: string;
  lot_number: string;
  source_name: string; // เช่น สวนลุงสมชาย จันทบุรี
  purchase_date: string;
  variety: string;     // เช่น หมอนทอง, ก้านยาว
  grade: string;       // เช่น เกรด A, เกรด B, เหมาสวน
  initial_weight_kg: number;
  cost_total: number;
  cost_per_kg: number;
  notes?: string;
  created_at: string;
}

export interface Expense {
  id: string;
  season_id?: string;
  lot_id?: string | null;
  title: string;
  category: ExpenseCategory;
  amount: number;
  expense_date: string;
  notes?: string;
  created_at: string;
}

export interface WasteRecord {
  id: string;
  season_id?: string;
  product_id?: string | null;
  variety: string;
  waste_type: WasteType;
  weight_kg: number;
  estimated_loss_value: number;
  reason: string;
  recorded_at: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  unit_type: UnitType;
  unit_price: number;
  quantity_or_weight: number; // e.g. 3.45 kg or 2 boxes (net weight)
  gross_weight?: number;      // น้ำหนักรวมก่อนหักภาชนะ
  tare_weight?: number;       // น้ำหนักภาชนะที่หัก (กก.)
  subtotal: number;
  item_cost: number;
  notes?: string;
}

export interface Order {
  id: string;
  order_number: string;
  season_id?: string;
  customer_name: string;
  customer_phone?: string;
  customer_type: CustomerType;
  subtotal: number;
  discount: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  cash_received?: number;
  change_given?: number;
  due_date?: string | null;
  notes?: string;
  items: OrderItem[];
  created_at: string;
  synced?: boolean;
}

export interface DebtPayment {
  id: string;
  order_id: string;
  amount_paid: number;
  payment_method: PaymentMethod;
  paid_at: string;
  notes?: string;
}

export interface StoreSettings {
  store_name: string;
  branch: string;
  phone: string;
  promptpay_id: string;
  promptpay_type: 'mobile' | 'national_id';
  address: string;
  receipt_footer: string;
  tax_id?: string;
  sound_enabled?: boolean;
  large_font?: boolean;
}
