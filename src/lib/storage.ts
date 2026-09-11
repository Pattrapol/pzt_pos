'use client';

import { 
  Product, 
  InboundLot, 
  Expense, 
  WasteRecord, 
  Order, 
  StoreSettings, 
  Season,
  PaymentMethod
} from '@/types/pos';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  PRODUCTS: 'pzt_pos_products_v1',
  LOTS: 'pzt_pos_lots_v1',
  EXPENSES: 'pzt_pos_expenses_v1',
  WASTE: 'pzt_pos_waste_v1',
  ORDERS: 'pzt_pos_orders_v1',
  SETTINGS: 'pzt_pos_settings_v1',
  SEASONS: 'pzt_pos_seasons_v1',
};

export const DEFAULT_SETTINGS: StoreSettings = {
  store_name: 'สวนทุเรียน & ผลไม้สด พรีเมียม (PZT FRUIT)',
  branch: 'สาขาหน้าสวนระยอง-จันทบุรี',
  phone: '081-234-5678',
  promptpay_id: '0812345678',
  promptpay_type: 'mobile',
  address: '123/4 หมู่ 5 ถ.สุขุมวิท ต.ทางเกวียน อ.แกลง จ.ระยอง',
  receipt_footer: 'ขอบคุณที่อุดหนุนผลไม้สดจากสวนแท้ 100% | มีปัญหาทุเรียนอ่อน/เคลมได้ภายใน 24 ชม.',
  tax_id: '0105559999888'
};

export const DEFAULT_SEASON: Season = {
  id: 'season-2026',
  name: 'ฤดูกาลทุเรียนระยอง-จันทบุรี 2026',
  year: 2026,
  start_date: '2026-04-01',
  end_date: null,
  status: 'active',
  budget: 500000,
  notes: 'รอบเหมาสวนทุเรียนหมอนทองและก้านยาวประจำปี 2569',
  created_at: new Date().toISOString()
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p-1',
    name: 'ทุเรียนหมอนทอง เกรด A (ทั้งลูก)',
    category: 'ทุเรียน',
    unit_type: 'kg',
    price_per_unit: 180,
    cost_per_unit: 120,
    current_stock: 450,
    image_emoji: '🍈',
    is_active: true,
  },
  {
    id: 'p-2',
    name: 'ทุเรียนหมอนทอง เกรด B (ทั้งลูก)',
    category: 'ทุเรียน',
    unit_type: 'kg',
    price_per_unit: 140,
    cost_per_unit: 95,
    current_stock: 280,
    image_emoji: '🍈',
    is_active: true,
  },
  {
    id: 'p-3',
    name: 'ทุเรียนก้านยาวพรีเมียม (ทั้งลูก)',
    category: 'ทุเรียน',
    unit_type: 'kg',
    price_per_unit: 290,
    cost_per_unit: 190,
    current_stock: 120,
    image_emoji: '🍈',
    is_active: true,
  },
  {
    id: 'p-4',
    name: 'ทุเรียนชะนีไข่ (ทั้งลูก)',
    category: 'ทุเรียน',
    unit_type: 'kg',
    price_per_unit: 130,
    cost_per_unit: 85,
    current_stock: 160,
    image_emoji: '🍈',
    is_active: true,
  },
  {
    id: 'p-5',
    name: 'หมอนทองแกะเนื้อล้วน (กล่อง 500g)',
    category: 'ทุเรียนแกะเนื้อ',
    unit_type: 'box',
    price_per_unit: 420,
    cost_per_unit: 260,
    current_stock: 35,
    image_emoji: '📦',
    is_active: true,
  },
  {
    id: 'p-6',
    name: 'มังคุดคัดเกรดส่งออก ผิวลายหวานกรอบ',
    category: 'ผลไม้สด',
    unit_type: 'kg',
    price_per_unit: 85,
    cost_per_unit: 50,
    current_stock: 300,
    image_emoji: '🫐',
    is_active: true,
  },
  {
    id: 'p-7',
    name: 'เงาะโรงเรียน นาสาร สดจากต้น',
    category: 'ผลไม้สด',
    unit_type: 'kg',
    price_per_unit: 65,
    cost_per_unit: 38,
    current_stock: 250,
    image_emoji: '🍒',
    is_active: true,
  },
  {
    id: 'p-8',
    name: 'ทุเรียนทอดอบกรอบ แผ่นเกรด A (ถุง 250g)',
    category: 'แปรรูป',
    unit_type: 'piece',
    price_per_unit: 180,
    cost_per_unit: 110,
    current_stock: 50,
    image_emoji: '🍿',
    is_active: true,
  }
];

export const INITIAL_LOTS: InboundLot[] = [
  {
    id: 'lot-1',
    lot_number: 'LOT-2026-001',
    source_name: 'สวนลุงสมชาย จันทบุรี (แปลงเขาคิชฌกูฏ)',
    purchase_date: '2026-05-10',
    variety: 'หมอนทอง',
    grade: 'เกรด A',
    initial_weight_kg: 550,
    cost_total: 66000,
    cost_per_kg: 120,
    notes: 'ทุเรียนแก่จัด 85% คัตติ้งสวย ไม่มีเพลี้ย',
    created_at: new Date('2026-05-10T08:00:00Z').toISOString()
  },
  {
    id: 'lot-2',
    lot_number: 'LOT-2026-002',
    source_name: 'สวนป้ามาลี ระยอง (แปลงเชิงเนิน)',
    purchase_date: '2026-05-12',
    variety: 'ก้านยาว',
    grade: 'พรีเมียม',
    initial_weight_kg: 150,
    cost_total: 28500,
    cost_per_kg: 190,
    notes: 'ก้านยาวลูกกลมสวย ขั้วสดเต่งตึง',
    created_at: new Date('2026-05-12T09:30:00Z').toISOString()
  },
  {
    id: 'lot-3',
    lot_number: 'LOT-2026-003',
    source_name: 'กลุ่มชาวสวนมังคุดแปลงใหญ่ ท่าใหม่',
    purchase_date: '2026-05-14',
    variety: 'มังคุด',
    grade: 'เกรดส่งออก',
    initial_weight_kg: 350,
    cost_total: 17500,
    cost_per_kg: 50,
    notes: 'มังคุดไซส์ 12-14 ลูก/กก. ก้นกากบาทสมบูรณ์',
    created_at: new Date('2026-05-14T11:00:00Z').toISOString()
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    title: 'ค่าจ้างคนงานตัดและขนขึ้นรถ (ทีมลุงนิด 4 คน)',
    category: 'labor',
    amount: 3600,
    expense_date: '2026-05-10',
    notes: 'เหมาตัดทุเรียนล็อต LOT-001',
    created_at: new Date('2026-05-10T15:00:00Z').toISOString()
  },
  {
    id: 'exp-2',
    title: 'ค่าน้ำมันรถกระบะขนส่งจากจันทบุรีมาหน้าร้าน',
    category: 'transport',
    amount: 1800,
    expense_date: '2026-05-10',
    notes: 'ระยะทาง 140 กม.',
    created_at: new Date('2026-05-10T18:00:00Z').toISOString()
  },
  {
    id: 'exp-3',
    title: 'ซื้อกล่องไปรษณีย์ไดคัท + ถาดรองโฟม + เทปฟอยล์',
    category: 'packaging',
    amount: 2450,
    expense_date: '2026-05-11',
    notes: 'กล่องไซส์เบอร์ 00 และกล่องใส่เนื้อแกะ 100 ชุด',
    created_at: new Date('2026-05-11T10:00:00Z').toISOString()
  },
  {
    id: 'exp-4',
    title: 'ค่าเช่าเต็นท์และแผงจำหน่ายริมทางหลวงประจำสัปดาห์',
    category: 'stall_rent',
    amount: 3000,
    expense_date: '2026-05-12',
    notes: 'มัดจำและจ่ายรายสัปดาห์',
    created_at: new Date('2026-05-12T12:00:00Z').toISOString()
  }
];

export const INITIAL_WASTE: WasteRecord[] = [
  {
    id: 'w-1',
    variety: 'หมอนทอง',
    waste_type: 'spoilage',
    weight_kg: 12.5,
    estimated_loss_value: 1500,
    reason: 'ผลแตกยอดหนามและสุกงอมเกินมาตรฐาน',
    recorded_at: new Date('2026-05-13T16:00:00Z').toISOString()
  },
  {
    id: 'w-2',
    variety: 'มังคุด',
    waste_type: 'damaged',
    weight_kg: 6.0,
    estimated_loss_value: 300,
    reason: 'ผลแข็งยางไหล ตกเกรดตอนคัด',
    recorded_at: new Date('2026-05-14T17:00:00Z').toISOString()
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    order_number: 'POS-20260515-001',
    customer_name: 'คุณวิชัย (ลูกค้าประจำ)',
    customer_phone: '089-111-2233',
    customer_type: 'regular',
    subtotal: 1080,
    discount: 80,
    total_amount: 1000,
    payment_method: 'promptpay',
    payment_status: 'paid',
    items: [
      {
        id: 'item-1',
        product_id: 'p-1',
        product_name: 'ทุเรียนหมอนทอง เกรด A (ทั้งลูก)',
        unit_type: 'kg',
        unit_price: 180,
        quantity_or_weight: 6.0,
        subtotal: 1080,
        item_cost: 720
      }
    ],
    created_at: new Date('2026-05-15T10:15:00Z').toISOString()
  }
];

class StorageManager {
  private hasSynced = false;

  private getItem<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
      console.error(`Error reading ${key} from localStorage`, e);
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing ${key} to localStorage`, e);
    }
  }

  public init(): void {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      this.setItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOTS)) {
      this.setItem(STORAGE_KEYS.LOTS, INITIAL_LOTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EXPENSES)) {
      this.setItem(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.WASTE)) {
      this.setItem(STORAGE_KEYS.WASTE, INITIAL_WASTE);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      this.setItem(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      this.setItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SEASONS)) {
      this.setItem(STORAGE_KEYS.SEASONS, [DEFAULT_SEASON]);
    }

    // Trigger cloud sync in background if Supabase is connected
    if (!this.hasSynced && isSupabaseConfigured && supabase) {
      this.hasSynced = true;
      this.syncFromSupabase();
    }
  }

  // Sync latest records from Supabase Cloud
  public async syncFromSupabase(): Promise<void> {
    if (!supabase) return;
    try {
      // Sync products
      const { data: dbProducts } = await supabase.from('products').select('*');
      if (dbProducts && dbProducts.length > 0) {
        this.setItem(STORAGE_KEYS.PRODUCTS, dbProducts);
      }

      // Sync settings
      const { data: dbSettings } = await supabase.from('store_settings').select('*').limit(1);
      if (dbSettings && dbSettings.length > 0) {
        this.setItem(STORAGE_KEYS.SETTINGS, dbSettings[0]);
      }
    } catch (err) {
      console.warn('Supabase initial sync skipped, using cached data.', err);
    }
  }

  public resetToDemo(): void {
    this.setItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    this.setItem(STORAGE_KEYS.LOTS, INITIAL_LOTS);
    this.setItem(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    this.setItem(STORAGE_KEYS.WASTE, INITIAL_WASTE);
    this.setItem(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    this.setItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    this.setItem(STORAGE_KEYS.SEASONS, [DEFAULT_SEASON]);
  }

  // Products
  public getProducts(): Product[] {
    this.init();
    return this.getItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }

  public saveProduct(product: Product): Product {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.unshift({
        ...product,
        id: product.id || 'p-' + Date.now()
      });
    }
    this.setItem(STORAGE_KEYS.PRODUCTS, products);

    // Sync to Supabase
    if (supabase) {
      supabase.from('products').upsert({
        id: product.id,
        name: product.name,
        category: product.category,
        unit_type: product.unit_type,
        price_per_unit: product.price_per_unit,
        cost_per_unit: product.cost_per_unit,
        current_stock: product.current_stock,
        image_emoji: product.image_emoji,
        is_active: product.is_active
      }).then();
    }

    return product;
  }

  public deleteProduct(id: string): void {
    const products = this.getProducts().filter(p => p.id !== id);
    this.setItem(STORAGE_KEYS.PRODUCTS, products);

    if (supabase) {
      supabase.from('products').delete().eq('id', id).then();
    }
  }

  // Inbound Lots
  public getLots(): InboundLot[] {
    this.init();
    return this.getItem<InboundLot[]>(STORAGE_KEYS.LOTS, INITIAL_LOTS);
  }

  public addLot(lotData: Omit<InboundLot, 'id' | 'cost_per_kg' | 'created_at'>): InboundLot {
    const lots = this.getLots();
    const cost_per_kg = lotData.initial_weight_kg > 0 
      ? Math.round((lotData.cost_total / lotData.initial_weight_kg) * 100) / 100 
      : 0;

    const newLot: InboundLot = {
      ...lotData,
      id: 'lot-' + Date.now(),
      cost_per_kg,
      created_at: new Date().toISOString()
    };
    lots.unshift(newLot);
    this.setItem(STORAGE_KEYS.LOTS, lots);

    // Update product stock
    const products = this.getProducts();
    const matchedProduct = products.find(p => p.name.includes(lotData.variety));
    if (matchedProduct) {
      matchedProduct.current_stock = (matchedProduct.current_stock || 0) + lotData.initial_weight_kg;
      matchedProduct.cost_per_unit = cost_per_kg;
      this.saveProduct(matchedProduct);
    }

    // Sync to Supabase
    if (supabase) {
      supabase.from('inbound_lots').insert({
        lot_number: newLot.lot_number,
        source_name: newLot.source_name,
        purchase_date: newLot.purchase_date,
        variety: newLot.variety,
        grade: newLot.grade,
        initial_weight_kg: newLot.initial_weight_kg,
        cost_total: newLot.cost_total,
        notes: newLot.notes || null,
      }).then();
    }

    return newLot;
  }

  public deleteLot(id: string): void {
    const lots = this.getLots().filter(l => l.id !== id);
    this.setItem(STORAGE_KEYS.LOTS, lots);
  }

  // Expenses
  public getExpenses(): Expense[] {
    this.init();
    return this.getItem<Expense[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
  }

  public addExpense(expenseData: Omit<Expense, 'id' | 'created_at'>): Expense {
    const expenses = this.getExpenses();
    const newExp: Expense = {
      ...expenseData,
      id: 'exp-' + Date.now(),
      created_at: new Date().toISOString()
    };
    expenses.unshift(newExp);
    this.setItem(STORAGE_KEYS.EXPENSES, expenses);

    // Sync to Supabase
    if (supabase) {
      supabase.from('expenses').insert({
        title: newExp.title,
        category: newExp.category,
        amount: newExp.amount,
        expense_date: newExp.expense_date,
        notes: newExp.notes || null
      }).then();
    }

    return newExp;
  }

  public deleteExpense(id: string): void {
    const expenses = this.getExpenses().filter(e => e.id !== id);
    this.setItem(STORAGE_KEYS.EXPENSES, expenses);
  }

  // Waste Records
  public getWasteRecords(): WasteRecord[] {
    this.init();
    return this.getItem<WasteRecord[]>(STORAGE_KEYS.WASTE, INITIAL_WASTE);
  }

  public addWasteRecord(wasteData: Omit<WasteRecord, 'id' | 'recorded_at'>): WasteRecord {
    const waste = this.getWasteRecords();
    const newWaste: WasteRecord = {
      ...wasteData,
      id: 'w-' + Date.now(),
      recorded_at: new Date().toISOString()
    };
    waste.unshift(newWaste);
    this.setItem(STORAGE_KEYS.WASTE, waste);

    // Deduct stock
    const products = this.getProducts();
    const matched = products.find(p => p.name.includes(wasteData.variety));
    if (matched) {
      matched.current_stock = Math.max(0, (matched.current_stock || 0) - wasteData.weight_kg);
      this.saveProduct(matched);
    }

    // Sync to Supabase
    if (supabase) {
      supabase.from('waste_records').insert({
        variety: newWaste.variety,
        waste_type: newWaste.waste_type,
        weight_kg: newWaste.weight_kg,
        estimated_loss_value: newWaste.estimated_loss_value,
        reason: newWaste.reason || null
      }).then();
    }

    return newWaste;
  }

  public deleteWasteRecord(id: string): void {
    const waste = this.getWasteRecords().filter(w => w.id !== id);
    this.setItem(STORAGE_KEYS.WASTE, waste);
  }

  // Orders
  public getOrders(): Order[] {
    this.init();
    return this.getItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  }

  public createOrder(orderData: Omit<Order, 'id' | 'order_number' | 'created_at'>): Order {
    const orders = this.getOrders();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const seq = (orders.length + 1).toString().padStart(3, '0');
    const order_number = `POS-${dateStr}-${seq}`;

    const newOrder: Order = {
      ...orderData,
      id: 'ord-' + Date.now(),
      order_number,
      created_at: new Date().toISOString()
    };

    orders.unshift(newOrder);
    this.setItem(STORAGE_KEYS.ORDERS, orders);

    // Deduct stock
    const products = this.getProducts();
    for (const item of newOrder.items) {
      const prod = products.find(p => p.id === item.product_id);
      if (prod) {
        prod.current_stock = Math.max(0, (prod.current_stock || 0) - item.quantity_or_weight);
      }
    }
    this.setItem(STORAGE_KEYS.PRODUCTS, products);

    // Live Sync Order to Supabase Cloud
    const client = supabase;
    if (client) {
      client.from('orders').insert({
        order_number: newOrder.order_number,
        customer_name: newOrder.customer_name,
        customer_phone: newOrder.customer_phone || null,
        customer_type: newOrder.customer_type,
        subtotal: newOrder.subtotal,
        discount: newOrder.discount,
        total_amount: newOrder.total_amount,
        payment_method: newOrder.payment_method,
        payment_status: newOrder.payment_status,
        cash_received: newOrder.cash_received || null,
        change_given: newOrder.change_given || null,
        due_date: newOrder.due_date || null,
        notes: newOrder.notes || null,
      }).select().then(({ data: ordData, error }) => {
        if (!error && ordData && ordData[0]) {
          const dbItems = newOrder.items.map(i => ({
            order_id: ordData[0].id,
            product_name: i.product_name,
            unit_type: i.unit_type,
            unit_price: i.unit_price,
            quantity_or_weight: i.quantity_or_weight,
            subtotal: i.subtotal,
            item_cost: i.item_cost || 0
          }));
          client.from('order_items').insert(dbItems).then();
        }
      });
    }

    return newOrder;
  }

  public updateOrderStatus(orderId: string, status: 'paid' | 'pending' | 'partial', paymentMethod?: PaymentMethod): void {
    const orders = this.getOrders();
    const target = orders.find(o => o.id === orderId);
    if (target) {
      target.payment_status = status;
      if (paymentMethod) target.payment_method = paymentMethod;
      this.setItem(STORAGE_KEYS.ORDERS, orders);

      if (supabase) {
        supabase.from('orders').update({
          payment_status: status,
          payment_method: paymentMethod || target.payment_method
        }).eq('order_number', target.order_number).then();
      }
    }
  }

  // Settings
  public getSettings(): StoreSettings {
    this.init();
    return this.getItem<StoreSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  public saveSettings(settings: StoreSettings): void {
    this.setItem(STORAGE_KEYS.SETTINGS, settings);

    if (supabase) {
      supabase.from('store_settings').upsert({
        id: 1,
        store_name: settings.store_name,
        branch: settings.branch,
        phone: settings.phone,
        promptpay_id: settings.promptpay_id,
        promptpay_type: settings.promptpay_type,
        address: settings.address,
        receipt_footer: settings.receipt_footer,
        tax_id: settings.tax_id || null
      }).then();
    }
  }

  // Financial Summary
  public getFinancialSummary() {
    const orders = this.getOrders();
    const lots = this.getLots();
    const expenses = this.getExpenses();
    const waste = this.getWasteRecords();

    const paidRevenue = orders
      .filter(o => o.payment_status === 'paid')
      .reduce((sum, o) => sum + o.total_amount, 0);

    const pendingRevenue = orders
      .filter(o => o.payment_status === 'pending')
      .reduce((sum, o) => sum + o.total_amount, 0);

    const totalRevenue = paidRevenue + pendingRevenue;

    let cogs = 0;
    let totalFruitSoldKg = 0;
    for (const ord of orders) {
      for (const item of ord.items) {
        cogs += (item.item_cost || 0) * (item.unit_type === 'kg' ? item.quantity_or_weight : item.quantity_or_weight);
        if (item.unit_type === 'kg') {
          totalFruitSoldKg += item.quantity_or_weight;
        }
      }
    }

    const totalLotCost = lots.reduce((sum, l) => sum + l.cost_total, 0);
    const totalLotWeightKg = lots.reduce((sum, l) => sum + l.initial_weight_kg, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalWasteLoss = waste.reduce((sum, w) => sum + w.estimated_loss_value, 0);
    const totalWasteKg = waste.reduce((sum, w) => sum + w.weight_kg, 0);

    const netProfit = totalRevenue - (cogs + totalExpenses + totalWasteLoss);
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0;

    const yieldPercentage = (totalFruitSoldKg + totalWasteKg) > 0
      ? (totalFruitSoldKg / (totalFruitSoldKg + totalWasteKg)) * 100
      : 100;

    return {
      paidRevenue,
      pendingRevenue,
      totalRevenue,
      cogs,
      totalLotCost,
      totalLotWeightKg,
      totalExpenses,
      totalWasteLoss,
      totalWasteKg,
      totalFruitSoldKg,
      netProfit,
      profitMargin: Math.round(profitMargin * 10) / 10,
      yieldPercentage: Math.round(yieldPercentage * 10) / 10,
      ordersCount: orders.length,
      unpaidOrdersCount: orders.filter(o => o.payment_status === 'pending').length
    };
  }
}

export const storage = new StorageManager();
