import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { ProcessStreamHandler } from '../common/utils/process-stream.util';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);

  async deploy(projectPath: string, channelId: string): Promise<string> {
    // 1. firebase.json 생성
    this.createFirebaseConfig(projectPath);

    // 2. Preview Channel 배포 및 URL 반환
    const previewUrl = await this.runPreviewChannelDeploy(projectPath, channelId);

    return previewUrl;
  }

  private createFirebaseConfig(projectPath: string): void {
    const config = {
      hosting: {
        public: 'build/web',
        ignore: ['firebase.json', '**/.*', '**/node_modules/**'],
        rewrites: [{ source: '**', destination: '/index.html' }],
      },
    };

    fs.writeFileSync(
      path.join(projectPath, 'firebase.json'),
      JSON.stringify(config, null, 2),
    );
    this.logger.log(`firebase.json 생성: ${projectPath}`);
  }

  private async runPreviewChannelDeploy(
    projectPath: string,
    channelId: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!process.env.FIREBASE_PROJECT_ID) {
        reject(new Error('Firebase Project ID를 찾을 수 없습니다.'));
        return;
      }

      const deploy = spawn(
        'firebase',
        [
          'hosting:channel:deploy',
          channelId,
          '--expires',
          '7d',
          '--project',
          process.env.FIREBASE_PROJECT_ID,
        ],
        {
          cwd: projectPath,
          timeout: 5 * 60 * 1000,
        },
      );

      const deployHandler = new ProcessStreamHandler(this.logger, {
        maxBufferLines: 200,
      });

      let previewUrl = '';

      deploy.stdout.on('data', (data) => {
        deployHandler.handleStdout(data);
        const dataString = data.toString();
        const match = dataString.match(/https:\/\/[^\s\[\]]+\.web\.app/);
        if (match) {
          previewUrl = match[0];
        }
      });

      deploy.stderr.on('data', (data) => deployHandler.handleStderr(data));

      deploy.on('close', (code) => {
        this.logger.log(`Firebase Preview Channel 배포 종료 (코드: ${code})`);

        if (code === 0) {
          resolve(previewUrl || `Preview Channel ${channelId} 배포 완료`);
        } else {
          reject(
            new Error(
              `Firebase Preview Channel 배포 실패 (종료 코드: ${code})\n\n` +
              `에러: ${deployHandler.getErrorSummary()}`,
            ),
          );
        }
      });

      deploy.on('error', (error) => {
        this.logger.error(`Firebase 배포 프로세스 에러: ${error.message}`);
        reject(
          new Error(
            `Firebase 배포 프로세스 실행 실패: ${error.message}\n` +
            `가능한 원인:\n` +
            `- Firebase CLI가 설치되지 않음\n` +
            `- Firebase 인증 실패`,
          ),
        );
      });
    });
  }
}
