import { apiSlice } from './apiSlice';

const PRODUCTS_URL = '/api/products';

const EXCLUDED_IDS = new Set([
  '2607130752441623600',
  '2607130905271619800',
  '2075876029409300482',
  '2046802660565475329',
  '2502151121241601900',
  '2043934021520044033',
  '2043944570651648002',
  '2043945824983830529',
  '2043943887814762497',
  '2043294797236301825',
  '2606121220391623700',
  '2075130484984541185',
]);

const isExcluded = (p: any) =>
  EXCLUDED_IDS.has(String(p?.pid ?? '')) ||
  EXCLUDED_IDS.has(String(p?.categoryId ?? p?.category ?? ''));

const filterExcluded = (products: any[]) =>
  Array.isArray(products)
    ? products.filter((p: any) => !isExcluded(p))
    : [];

const transformListResponse = (response: any) => {
  if (response?.products) {
    return { ...response, products: filterExcluded(response.products) };
  }
  return response;
};

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params: {
        categoryId?: string;
        collectionType?: string;
        gender?: string;
        subcategoryName?: string;
        q?: string;
        minPrice?: string;
        maxPrice?: string;
        colors?: string;
        sizes?: string;
        minRating?: string;
        pid?: string;
        sort?: string;
        pageNum?: number | string;
        pageSize?: number | string;
      } = {}) => ({
        url: PRODUCTS_URL,
        params,
      }),
      transformResponse: transformListResponse,
      providesTags: ['Product'],
      keepUnusedDataFor: 30,
    }),
    getProductDetails: builder.query({
      query: (productId) => ({
        url: `${PRODUCTS_URL}/${productId}`,
      }),
      transformResponse: (response: any) => {
        if (response && isExcluded(response)) {
          return null;
        }
        return response;
      },
      providesTags: (_, __, productId) => [{ type: 'Product' as const, id: productId }],
      keepUnusedDataFor: 30,
    }),
    getRelatedProducts: builder.query({
      query: (productId) => ({
        url: `${PRODUCTS_URL}/${productId}/related`,
      }),
      transformResponse: transformListResponse,
      providesTags: (_, __, productId) => [{ type: 'Product' as const, id: `related-${productId}` }],
      keepUnusedDataFor: 60,
    }),
    createReview: builder.mutation({
      query: ({ productId, rating, comment }) => ({
        url: `${PRODUCTS_URL}/${productId}/reviews`,
        method: 'POST',
        body: { rating, comment },
      }),
      invalidatesTags: (_, __, { productId }) => [{ type: 'Product' as const, id: productId }, 'Product'],
    }),
    getProductsByCategory: builder.query({
      query: ({ categoryId, pageNum, pageSize }: { categoryId: string; pageNum?: number; pageSize?: number }) => ({
        url: `${PRODUCTS_URL}/category/${categoryId}`,
        params: { pageNum, pageSize },
      }),
      transformResponse: transformListResponse,
      providesTags: ['Product'],
      keepUnusedDataFor: 30,
    }),
  }),
});

export const { 
  useGetProductsQuery, 
  useGetProductDetailsQuery,
  useGetRelatedProductsQuery,
  useGetProductsByCategoryQuery,
  useCreateReviewMutation 
} = productApiSlice;
