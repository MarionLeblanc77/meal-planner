import { IsString, IsOptional, Length, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateIngredientDto {
    @IsString()
    @Length(1, 255)
    name: string;
    
    @Transform(({ value }) => (value === 'false' ? false : true))
    @IsOptional()
    @IsBoolean ()
    onSeason: boolean;
}
