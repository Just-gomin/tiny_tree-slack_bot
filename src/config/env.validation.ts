import { plainToInstance } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  // Slack
  @IsString()
  @IsNotEmpty()
  SLACK_BOT_TOKEN: string;

  @IsString()
  @IsNotEmpty()
  SLACK_SIGNING_SECRET: string;

  @IsString()
  @IsNotEmpty()
  SLACK_APP_TOKEN: string;

  // Claude Code
  @IsString()
  @IsNotEmpty()
  CLAUDE_CODE_PATH: string;

  // Project Path
  @IsString()
  @IsNotEmpty()
  TINY_TREE_PATH: string;

  // Firebase
  @IsString()
  @IsNotEmpty()
  FIREBASE_PROJECT_ID: string;

  // Application
  @IsString()
  @IsOptional()
  PORT: string = '3000';

  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
