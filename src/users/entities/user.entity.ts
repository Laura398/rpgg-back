import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, now } from 'mongoose';
import bcrypt from 'bcryptjs';

@Schema()
export class User extends Document {
    @Prop({ required: true })
    username: string;

    @Prop({ required: true, unique: true})
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({default: now()})
    createdAt: Date;

    @Prop({default: now()})
    updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);