import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  constructor(
    private readonly productsServices: ProductsService
  ){}
  
  async runSeed() {
    await this.insertProduct();

    return 'Seed executed'
  }
  private async insertProduct(){
   await this.productsServices.deleteAllProducts()

   const products = initialData.products;

    const insertPromises: Promise<any>[] = [];

    products.forEach(product => {
    insertPromises.push(this.productsServices.create(product));
  });

  await Promise.all(insertPromises);

   return true
  }
}
