import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, ProductImage } from './entities/index';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';


@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    //Esto esta creando las tablas en nuestra base de datos
    TypeOrmModule.forFeature([ Product, ProductImage ])
  ]
})
export class ProductsModule {}
