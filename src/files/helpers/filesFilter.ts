
//& Todo esto valida el archivo que subamos si es una imagen solamente si es permitido manda true o false 
export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {

    console.log({file});
    
    if(!file) return callback(new Error(`File esta vacio`), false );

    const fileExptension = file.mimetype.split('/')[1];
    const validExtension = [ 'jpg','jpeg', 'png','gif' ];

    if ( validExtension.includes(fileExptension)) {
        return callback(null, true)
    }

    callback(null,false)

}