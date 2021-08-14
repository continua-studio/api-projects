import {Field, ObjectType, ID, InputType} from "type-graphql";

@ObjectType()
export class Project {
  @Field(type => ID)
  id: string = "";
  @Field()
  name: string = "";
  @Field()
  created: string = "";
  @Field()
  updated: string = "";
}

@InputType()
export class CreateProject {
  @Field()
  name: string = "";
}

export interface IDynamoProject {
  key: string
  sort_key: string
  name: string;
  created: string;
  updated: string;
}

export interface IProject {
  id: string;
  name: string;
  created: Date;
  updated: Date
}