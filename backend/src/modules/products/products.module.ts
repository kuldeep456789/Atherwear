// import { Module } from '@nestjs/common';
// import { JwtModule } from '@nestjs/jwt';
// import { MongooseModule } from '@nestjs/mongoose';
// import { CjModule } from '../cj/cj.module';
// import { RedisModule } from '../redis/redis.module';
// import { UsersModule } from '../users/users.module';
// import { Product, ProductSchema } from './schemas/product.schema';
// import { Review, ReviewSchema } from './schemas/review.schema';
// import { ProductsController } from './products.controller';
// import { ProductsService } from './products.service';

// @Module({
//   imports: [
//     CjModule,
//     RedisModule,
//     UsersModule,
//     JwtModule.register({
//       secret: process.env.JWT_SECRET ?? 'development-jwt-secret',
//     }),
//     MongooseModule.forFeature([
//       { name: Product.name, schema: ProductSchema },
//       { name: Review.name, schema: ReviewSchema },
//     ]),
//   ],
//   controllers: [ProductsController],
//   providers: [ProductsService],
// })
// export class ProductsModule {}



import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { CjModule } from '../cj/cj.module';
import { RedisModule } from '../redis/redis.module';
import { UsersModule } from '../users/users.module';

import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

import { Product, ProductSchema } from './schemas/product.schema';
import { Review, ReviewSchema } from './schemas/review.schema';

@Module({
  imports: [
    CjModule,
    RedisModule,
    UsersModule,

    JwtModule.register({
      secret: process.env.JWT_SECRET || 'development-jwt-secret',
      signOptions: {
        expiresIn: '7d',
      },
    }),

    MongooseModule.forFeature([
      {
        name: Product.name,
        schema: ProductSchema,
      },
      {
        name: Review.name,
        schema: ReviewSchema,
      },
    ]),
  ],

  controllers: [ProductsController],

  providers: [ProductsService],

  exports: [ProductsService],
})
export class ProductsModule { }