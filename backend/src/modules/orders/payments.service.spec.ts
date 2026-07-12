import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'crypto';
import { UsersService } from '../users/users.service';
import { PaymentsService } from './payments.service';
import { Order } from './schemas/order.schema';

const razorpayOrdersCreate = jest.fn();

jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => ({
    orders: {
      create: razorpayOrdersCreate,
    },
  }));
});

describe('PaymentsService', () => {
  let paymentsService: PaymentsService;
  const userId = '507f1f77bcf86cd799439011';

  const orderModel = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const jwtService = {
    verifyAsync: jest.fn(),
  };

  const usersService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: getModelToken(Order.name), useValue: orderModel },
        { provide: JwtService, useValue: jwtService },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    paymentsService = module.get(PaymentsService);
  });

  it('rejects creating a payment order for an already paid order', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: userId });
    usersService.findById.mockResolvedValue({ id: userId });
    orderModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        paymentStatus: 'paid',
      }),
    });

    await expect(
      paymentsService.createPaymentOrder('token', { orderId: 'order-id' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('creates a razorpay order and stores the gateway order id', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: userId });
    usersService.findById.mockResolvedValue({ id: userId });

    const order = {
      id: 'order-id',
      totalAmount: 125,
      paymentStatus: 'unpaid',
      save: jest.fn().mockResolvedValue(undefined),
    };

    orderModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(order),
    });
    razorpayOrdersCreate.mockResolvedValue({ id: 'gateway-id' });

    const response = await paymentsService.createPaymentOrder('token', {
      orderId: 'order-id',
    });

    expect(razorpayOrdersCreate).toHaveBeenCalledWith({
      amount: 12500,
      currency: 'INR',
      receipt: 'order-id',
      payment_capture: true,
    });
    expect(order.razorpayOrderId).toBe('gateway-id');
    expect(order.paymentReference).toBe('gateway-id');
    expect(order.save).toHaveBeenCalled();
    expect(response.keyId).toBe(process.env.RAZORPAY_KEY_ID ?? '');
  });

  it('rejects verifying a payment before a gateway order exists', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: userId });
    usersService.findById.mockResolvedValue({ id: userId });
    orderModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        id: 'order-id',
        razorpayOrderId: undefined,
      }),
    });

    await expect(
      paymentsService.verifyPayment('token', {
        orderId: 'order-id',
        razorpayOrderId: 'gateway-order',
        razorpayPaymentId: 'payment-id',
        razorpaySignature: 'signature',
      }),
    ).rejects.toThrow('Payment order has not been created');
  });

  it('verifies payment and marks the order as confirmed', async () => {
    process.env.RAZORPAY_KEY_SECRET = 'secret';

    jwtService.verifyAsync.mockResolvedValue({ sub: userId });
    usersService.findById.mockResolvedValue({ id: userId });

    const order = {
      id: 'order-id',
      totalAmount: 100,
      razorpayOrderId: 'gateway-order',
      save: jest.fn().mockResolvedValue(undefined),
    } as Partial<Order> & { save: jest.Mock };

    orderModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(order),
    });

    const signature = createHmac('sha256', 'secret')
      .update('gateway-order|payment-id')
      .digest('hex');

    const response = await paymentsService.verifyPayment('token', {
      orderId: 'order-id',
      razorpayOrderId: 'gateway-order',
      razorpayPaymentId: 'payment-id',
      razorpaySignature: signature,
    });

    expect(order.paymentStatus).toBe('paid');
    expect(order.status).toBe('confirmed');
    expect(order.save).toHaveBeenCalled();
    expect(response.order).toBe(order);
  });
});
