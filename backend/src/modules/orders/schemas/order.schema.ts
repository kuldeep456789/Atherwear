import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
export type OrderDocument = HydratedDocument<Order>;
@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: String, required: true })
  productId: string;

  @Prop({ required: true })
  quantity: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: [OrderItemSchema], default: [] })
  items: OrderItem[];

  @Prop({ required: true, default: 0 })
  totalAmount: number;

  @Prop({ required: true, default: 'pending' })
  status: string;

  @Prop({ required: true, default: 'Razorpay' })
  paymentProvider: string;

  @Prop({ required: true, enum: ['unpaid', 'paid', 'pending'], default: 'unpaid' })
  paymentStatus: string;

  @Prop()
  paymentReference?: string;

  @Prop()
  razorpayOrderId?: string;

  @Prop()
  razorpayPaymentId?: string;

  @Prop()
  razorpaySignature?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
