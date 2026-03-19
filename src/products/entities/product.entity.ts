import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

// Esto es una tabla en base de datos
@Entity()
export class Product {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        //Regla el titulo no puede haber productos con el mismo nombre
        unique: true
    })
    title: string;

    @Column('float',{
        default: 0
    })
    price: number;

    @Column({
        type: 'text',
        //Puede aceptar nulos
        nullable: true
    })
    description: string;

    @Column({
        unique: true
    })
    slug: string;

    @Column('int', {
        default: 0
    })
    stock: number;

    @Column('text',{
        array: true
    })
    size: string[]
    
    
    @Column('text')
    gender: string;

    @Column('text',{
        array: true,
        default: []
    })
    tags: string[];

    //Esto ayuda antes de insertar, si el slug no existe sera el titlo y remplaza caracteres
    @BeforeInsert()
    updateSlugInsert() {
        if( !this.slug ) {
            this.slug = this.title
        }
         this.slug = this.slug
            .toLocaleLowerCase()
            .replaceAll(' ','_')
            .replaceAll("'",'')
    }

    @BeforeUpdate()
    updateSlugBefore(){
        this.slug = this.slug
        .toLocaleLowerCase()
        .replaceAll(' ','_')
        .replaceAll("'",'')
    }
}
