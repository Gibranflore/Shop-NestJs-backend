import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, Repository } from 'typeorm';

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

    private readonly dataSource: DataSource
  
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
  async findAll( pginationDTO: PaginationDTO) {
    const {limit = 10, offset = 0 } = pginationDTO;
     const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      }
     })
     //Esto es para añadir las imagenes al post tenga o no tengan estara en postman y lo ordena en un solo array
    return products.map( product => ({
      ...product, 
      images: product.images.map( img => img.url )
    }))
  }

  async findOne(term: string) {
    
    let product: Product | null = null

    if ( isUUID(term ) ) {
       product = await this.productRepository.findOneBy({ id : term})

    } else {
      //Esto es para guardar el slug y el title en minisuclas
       const queryBuilder = this.productRepository.createQueryBuilder('prod');
       product = await queryBuilder
        .where((`title=:title or slug=:slug`), {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        //Esto es para añadir las imagenes
       .leftJoinAndSelect('prod.images', 'prodImages')
       .getOne();
    }
    
    //const product = await this.productRepository.findOneBy({id})
    if (!product) {
      throw new NotFoundException(`No se encontro el producto con el id ${term}`)
    }
    return product
  }

  //Creamos un regresa todo pero con las imagenes lo crea en una solo array y no lo divide en muchos
  async findOnePlain( term: string) {
    const { images = [], ...rest} = await this.findOne(term)
    return {
      ...rest,
      images: images.map(image => image.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const {images, ...toUpdate } = updateProductDto

    const product = await this.productRepository.preload({ id,...toUpdate })

    if(!product) throw new NotFoundException(`El id ${id} no fue encontrado`)
    
      //Crear el queryRunner no impacatar la base de datos hasta que nosotros hagamos un commit que queremos subir
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {

      //Esto impacta si tenemos imagenes 
      if( images ) {
        await queryRunner.manager.delete( ProductImage, {product: { id }})
        product.images = images.map( 
          image => this.productImageRepository.create({ url: image })
        )
        //Esto se hara si no tenemos images
      }
      //intenta guardarlo
      await queryRunner.manager.save( product )
      //await this.productRepository.save(product);
      await queryRunner.commitTransaction()
      await queryRunner.release()
      //return product
      return this.findOnePlain(id)
      
    } catch (error) {
      await queryRunner.rollbackTransaction()
      await queryRunner.release()
      this.handleExceptions(error)
    }
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
  //Una forma de eliminar todos los productos en casada
  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product')

    try {
      
      return await query
      .delete()
      .where({})
      .execute()
      
    } catch (error) {
      this.handleExceptions(error)
    }
  }
}

