import {
  Schema,
  SchemaFactory,
  Prop
} from "@nestjs/mongoose";
import {
  Document
} from 'mongoose';



export type UserDocument = User & Document;

@Schema()
export class User {


  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true , type : String /*, select : false*/ })
  password: string;

  @Prop({ default : null })
  resetPasswordToken: string;

  @Prop({ default: "" })
  phoneNumber: string;

  @Prop({ default: false })
  isBlocked: boolean;

  @Prop({ default: "" })
  bio: string;

  @Prop({ default: "" })
  birthday: string;

  @Prop({ default: "" })
  companyName: string;

  @Prop({ default: "" })
  adresse: string;

  @Prop({ default: "challenger" })
  role: string;


  @Prop({ nullable: true, default: null }) 
  image?: string;

  // Ajout de la propriété verificationCode
  @Prop({ default: null })
  verificationCode: string;



}

export const UserSchema = SchemaFactory.createForClass(User);