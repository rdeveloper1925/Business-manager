export type CustomerListFilters = {
    search: string;
    sort: 'full_name' | 'phone_number' | 'email';
    direction: 'asc' | 'desc';
};

export type Customer = {
    customer_id: number;
    full_name: string;
    organization_name: string | null;
    phone_number: string;
    email: string;
    address: string;
    tax_id: string | null;
    created_at?: string;
    updated_at?: string;
};

export type PaginatedCustomers = {
    data: Customer[];
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
