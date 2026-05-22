export type TransactionTypeValue =
    | 'RESTOCK'
    | 'SALE'
    | 'DAMAGED'
    | 'ADJUSTMENT'
    | 'RETURN'
    | 'TRANSFER'
    | 'STOCKTAKE';

export type ConditionTypeValue = 'GOOD' | 'DAMAGED' | 'DEFECTIVE';

export type StockStatus = 'OK' | 'LOW' | 'OUT';

export type StockSummary = {
    quantityOnHand: number;
    quantityReserved: number;
    quantityOnOrder: number;
    available: number;
    isBelowReorder: boolean;
};

export type InventorySupplierOption = {
    id: number;
    company_name: string;
};

export type InventoryRecord = {
    inventory_id: number;
    part_id: number;
    quantity_on_hand: number;
    quantity_reserved: number;
    quantity_on_order: number;
    latest_count: string | null;
};

export type PartSummary = {
    part_id: number;
    part_name: string;
    part_number: string;
    cost_price: string;
    sell_price: string;
    reorder_point: number;
    supplier_id: number | null;
    supplier?: { id: number; company_name: string } | null;
    inventory?: InventoryRecord | null;
    stock_summary?: StockSummary;
};

export type Part = PartSummary & {
    description: string | null;
    unit_of_measure: string;
    min_stock_level: number;
    max_stock_level: number;
    created_at?: string;
    updated_at?: string;
    inventory_transactions?: InventoryTransactionSummary[];
};

export type InventoryTransactionSummary = {
    transaction_id: number;
    part_id: number;
    supplier_id: number | null;
    transaction_type: TransactionTypeValue;
    qty_delta: number;
    qty_after: number;
    unit_cost: string | null;
    condition: ConditionTypeValue;
    notes: string | null;
    transacted_at: string;
    performer?: { id: number; name: string } | null;
    part?: { part_id: number; part_name: string; part_number: string } | null;
    supplier?: { id: number; company_name: string } | null;
};

export type InventoryTransaction = InventoryTransactionSummary;

export type PartFilterOption = {
    part_id: number;
    part_name: string;
    part_number: string;
};

export type PartOption = PartFilterOption & {
    reorder_point: number;
    supplier_id: number | null;
    quantity_on_hand: number;
};

export type EnumOption = {
    value: string;
    label: string;
};

export type TransactionListFilters = {
    part_id: number | null;
    transaction_types: TransactionTypeValue[];
    condition: ConditionTypeValue | null;
    date_from: string | null;
    date_to: string | null;
};

export type PaginatedTransactions = {
    data: InventoryTransactionSummary[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: {
        url: string | null;
        label: string;
        active: boolean;
        page?: number | null;
    }[];
    path: string;
    first_page_url: string;
    last_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
};

export type TransactionPreselected = {
    part_id: number | null;
    transaction_type: TransactionTypeValue | null;
};

export type PartListFilters = {
    search: string;
    supplier_id: number | null;
    sort:
        | 'part_name'
        | 'part_number'
        | 'cost_price'
        | 'sell_price'
        | 'quantity_on_hand';
    direction: 'asc' | 'desc';
};

export type PaginatedParts = {
    data: PartSummary[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: {
        url: string | null;
        label: string;
        active: boolean;
        page?: number | null;
    }[];
    path: string;
    first_page_url: string;
    last_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
};

export type SummaryCards = {
    totalParts: number;
    totalSkusInStock: number;
    lowStockAlerts: number;
    pendingOrders: number;
};

export type LowStockPart = PartSummary & {
    inventory: InventoryRecord;
    stock_summary?: StockSummary;
};
