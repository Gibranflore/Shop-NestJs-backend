import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import type { Express, Response } from 'express'
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/filesFilter';
import { diskStorage } from 'multer';
import { fileNamer } from './helpers/fileNamer.helper';
import { ConfigService } from '@nestjs/config';


@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService,
    private readonly configServise: ConfigService
  ) {}

  //Hacemos un get para llamar la imagen
  @Get('product/:imageName')
  findProductImage(
    //No quiero que te ocupes de mandar una respuesta, yo digo que lo hare manualmente
    @Res() res: Response,
    @Param('imageName') imageName: string ){

      const path = this.filesService.getStaticProductImage(imageName)
      
      return res.sendFile(path)

      //Este es el control que yo mando
    //   res.status(403).json({
    //     ok: false,
    //     path: path
    //   })
    }
  

  //~ Esto es para subir cualquier archivo se tiene que usar el uploadfiles()
  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    //limits: {}
    //Donde alamacenar los datos
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  })) 
  updateFiles(@UploadedFile() file: Express.Multer.File) { 

    
    if (!file ) {
      throw new BadRequestException('¿Seguro que este archivo es una imagen?')
    }
    //console.log({ fileInCotroller: file });
    //le asignamos otro nombre para poder llevar un buen control
    const secureUrl = `${this.configServise.get('HOST_API')}/files/product/${file.filename}`;
    
    return {
      secureUrl
    };
  }
}
