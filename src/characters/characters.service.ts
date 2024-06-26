import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RacesService } from 'src/races/races.service';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { Character } from './entities/character.entity';
import redefineCharacterStatsWithRace from './helpers/randomize/post-treatment/redefine-character-stats-with-race';
import { randomizeCharacter } from './helpers/randomize/randomize-character';
import { ClassesService } from 'src/classes/classes.service';
import redefineCharacterStatsWithClass from './helpers/randomize/post-treatment/redefine-character-stats-with-class';
import { defineCharacterClass } from './helpers/randomize/post-treatment/define-character-class';

@Injectable()
export class CharactersService {
  constructor (
    @InjectModel(Character.name) private readonly characterModel: Model<Character>,
    private readonly racesService: RacesService,
    private readonly classesService: ClassesService,
  ) {}

  findAll() {
    return this.characterModel.find().exec();
  }

  async findMany(selector: any, options?: any) {
    return await this.characterModel.find(selector, options).exec();
  }

  async findOneById(id: string) {
    return await this.characterModel.findById({ _id: id }).exec();
  }

  async findOne(selector: any, options?: any) {
    return await this.characterModel.findOne(selector, options).exec();
  }

  create(request: any, createCharacterDto: CreateCharacterDto) {
    const userId = request.user.sub;
    if (!userId) {
      throw new Error("User not found");
    }
    return new this.characterModel({...createCharacterDto, user: userId}).save();
  }

  async randomize(request: any) {
    try {
      const userId = request.user.sub;
      console.log('request', request);
      
      const newCharacter = randomizeCharacter();
      const allRaces = await this.racesService.findAll();
      const characterRace = allRaces.find((race) => race.name === newCharacter.race);
      const characterDependingOnRace = redefineCharacterStatsWithRace(newCharacter, characterRace);
      const allClasses = await this.classesService.findAll();
      const characterWithClass = defineCharacterClass(characterDependingOnRace, allRaces, allClasses);
      const classData = allClasses.find((characterClass) => characterClass.name === characterWithClass.class);
      const characterDependingOnClass = redefineCharacterStatsWithClass(characterWithClass, classData);
      console.log('characterDependingOnClass', characterDependingOnClass);
      
      return new this.characterModel({...characterDependingOnClass, user: userId}).save();
    } catch (error) {
      console.error('error', error);
      
      throw new Error("Error while randomizing character");
    }
    
  }

  async update(id: string, updateCharacterDto: UpdateCharacterDto) {
    return await this.characterModel.findByIdAndUpdate({ _id: id }, { $set: updateCharacterDto }, { new: true }).exec();
  }

  async remove(id: string) {
    return await this.characterModel.findByIdAndDelete({ _id: id }).exec();
  }

  async deleteAll() {
    return await this.characterModel.deleteMany({}).exec();
  }
}
