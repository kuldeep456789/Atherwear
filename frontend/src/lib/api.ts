export interface CjProduct {
    pid: string;
    productNameEn: string;
    productImage?: string;
    sellPrice?: string;
}

interface FeaturedProductsResponse {
    featured: CjProduct[];
}

/** Absolute backend origin when VITE_API_URL is a full URL; empty string uses Vite /api proxy. */
export function getApiBaseUrl(): string {
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    if (apiUrl.startsWith('http')) {
        return apiUrl.replace(/\/api\/?$/, '');
    }
    return '';
}

const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function getFeaturedProducts(): Promise<CjProduct[]> {
    const res = await fetch(`${API_URL}/cj/featured-products`);

    if (!res.ok) {
        throw new Error('Failed to fetch featured products');
    }

    const data: FeaturedProductsResponse = await res.json();
    return data.featured;
}
