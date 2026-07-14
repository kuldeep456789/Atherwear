import { apiSlice } from './apiSlice';

const AUTH_URL = '/api/auth';

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({ url: `${AUTH_URL}/login`, method: 'POST', body: data }),
    }),
    register: builder.mutation({
      query: (data) => ({ url: `${AUTH_URL}/register`, method: 'POST', body: data }),
    }),
    sendMobileOtp: builder.mutation({
      query: (data) => ({ url: `${AUTH_URL}/send-mobile-otp`, method: 'POST', body: data }),
    }),
    verifyMobileOtp: builder.mutation({
      query: (data) => ({ url: `${AUTH_URL}/verify-mobile-otp`, method: 'POST', body: data }),
    }),
    sendEmailOtp: builder.mutation({
      query: (data) => ({ url: `${AUTH_URL}/send-email-otp`, method: 'POST', body: data }),
    }),
    verifyEmailOtp: builder.mutation({
      query: (data) => ({ url: `${AUTH_URL}/verify-email-otp`, method: 'POST', body: data }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({ url: `${AUTH_URL}/reset-password`, method: 'POST', body: data }),
    }),
    getMe: builder.query({
      query: () => `${AUTH_URL}/me`,
      providesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useSendMobileOtpMutation,
  useVerifyMobileOtpMutation,
  useSendEmailOtpMutation,
  useVerifyEmailOtpMutation,
  useResetPasswordMutation,
  useGetMeQuery,
} = userApiSlice;
