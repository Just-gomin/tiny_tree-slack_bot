import { Module } from '@nestjs/common';
import { ClaudeModule } from '../claude/claude.module';
import { ProjectService } from './project.service';
import { ProjectSessionStore } from './lifecycle/project-session';

@Module({
  imports: [ClaudeModule],
  providers: [ProjectService, ProjectSessionStore],
  exports: [ProjectService, ProjectSessionStore],
})
export class ProjectModule {}
