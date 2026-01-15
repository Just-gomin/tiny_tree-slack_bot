import { Module } from '@nestjs/common';
import { ClaudeService } from './claude.service';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  providers: [ClaudeService],
  exports: [ClaudeService],
})
export class ClaudeModule {}
