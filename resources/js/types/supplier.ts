export type SupplierCategoryValue = 'OEM' | 'Aftermarket' | 'Other';

export type SupplierSummary = {
    id: number;
    contact_person_name: string;
    company_name: string;
    phone: string;
    email: string;
    category: SupplierCategoryValue;
    created_at?: string;
};

export type Supplier = SupplierSummary & {
    address: string;
    updated_at?: string;
};

export type SupplierListFilters = {
    search: string;
    sort:
        | 'contact_person_name'
        | 'company_name'
        | 'phone'
        | 'email'
        | 'category';
    direction: 'asc' | 'desc';
};

export type PaginatedSuppliers = {
    data: SupplierSummary[];
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
