export type PartListFilters = {
    search: string;
    sort: 'part_number' | 'part_name' | 'market_price' | 'created_at';
    direction: 'asc' | 'desc';
};

export type PartDesignationValue = 'oem' | 'aftermarket';

export type Part = {
    id: number;
    part_number: string;
    part_name: string;
    unit_of_measure: string;
    description: string | null;
    car_make: string | null;
    car_model: string | null;
    car_year: number | null;
    designation: PartDesignationValue;
    supplier: string | null;
    alternatives: string | null;
    market_price: string | null;
    created_by: number | null;
    created_at?: string;
    updated_at?: string;
};

export type PaginatedParts = {
    data: Part[];
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
