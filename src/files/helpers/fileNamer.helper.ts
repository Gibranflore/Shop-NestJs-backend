
import { v4 as uuid} from 'uuid'

//& Todo esto renombra la imagen que subamos en postman
export const fileNamer = (req: Express.Request, file: Express.Multer.File, callback: Function) => {

    //console.log({file});
    if(!file) return callback(new Error(`File esta vacio`), false );

    const fileExtension = file.mimetype.split('/')[1]
    //& Aui ya esta renombrando el archivo por otro nombre
    //Ahora con el uuid el nombre sera un id unico
    const fileName = `${ uuid() }.${fileExtension}`


    callback(null,fileName)

}