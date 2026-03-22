import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDTO } from 'src/common/DTO/Pagination';
import { validate as isUUID } from 'uuid';
import { ProductImage,Product } from './entities';



@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService')
  
  constructor(
    
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
  
  ) {}
  //Para salvar tiene que ser igual a nuestros DTO
  async create(createProductDto: CreateProductDto) {
    
    //Esto ayuda al slug tendrael nombre de titlo y remplaza comillas
    try {
      const {images = [], ...productDetails } = createProductDto;
      //Poder crear un producto, lo crea y los salva en la base de datos
      const producto = this.productRepository.create({
        ...productDetails,
        images: images.map( images => this.productImageRepository.create({ url : images}))
      })
      await this.productRepository.save(producto)
      return { ...producto, images: images}
      
      //Esto es nuestro error
    } catch (error) {
     this.handleExceptions(error)
    }

  }
  //TODO Hacer la paginacion
  findAll( pginationDTO: PaginationDTO) {
    const {limit = 10, offset = 0 } = pginationDTO;
     return this.productRepository.find({
      take: limit,
      skip: offset,
     })
    
  }

  async findOne(term: string) {
    
    let product: Product | null = null

    if ( isUUID(term ) ) {
       product = await this.productRepository.findOneBy({ id : term})

    } else {
       const queryBuilder = this.productRepository.createQueryBuilder();
       product = await queryBuilder.where((`title=:title or slug=:slug`), {
        title: term.toUpperCase(),
        slug: term.toLowerCase(),
       }).getOne();
    }
    
    //const product = await this.productRepository.findOneBy({id})
    if (!product) {
      throw new NotFoundException(`No se encontro el producto con el id ${term}`)
    }
    return product
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto,
      images: []
    })
    try {
      if(!product) throw new NotFoundException(`El id ${id} no fue encontrado`)
  
      await this.productRepository.save(product);
      
      
    } catch (error) {
      this.handleExceptions(error)
    }
    return product;
  }
  async remove(id: string) {
    const producto = await this.findOne( id )

    await this.productRepository.remove(producto)
  }

  //Es un manejo de erroes lo escrbimos 1 vez lo usamos siempre
  private handleExceptions( error : any ) {
    
      if(error.code === '23505')
      throw new BadRequestException(error.detail);

      this.logger.error(error)
      throw new InternalServerErrorException('Error revisa los logs del server')
  }
}

