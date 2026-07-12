import { apiSlice } from './apiSlice';

const PRODUCTS_URL = '/api/products';

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
      providesTags: ['Product'],
      keepUnusedDataFor: 30,
    }),
    getProductDetails: builder.query({
      query: (productId) => ({
        url: `${PRODUCTS_URL}/${productId}`,
      }),
      providesTags: (_, __, productId) => [{ type: 'Product' as const, id: productId }],
      keepUnusedDataFor: 30,
    }),
    getRelatedProducts: builder.query({
      query: (productId) => ({
        url: `${PRODUCTS_URL}/${productId}/related`,
      }),
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
