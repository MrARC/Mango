import { CreateDateColumn, Column, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export abstract class CUD {

    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column('timestamp', {nullable: true})
    deleted_at: Date;
}
