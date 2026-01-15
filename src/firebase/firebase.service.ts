import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { ProcessStreamHandler } from '../common/utils/process-stream.util';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);

  async deploy(projectPath: string, siteName: string): Promise<string> {
    // firebase.json 생성
    this.createFirebaseConfig(projectPath);

    // Firebase Hosting 배포
    await this.runFirebaseDeploy(projectPath, siteName);

    return `https://${siteName}.web.app`;
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
  }

  private async runFirebaseDeploy(
    projectPath: string,
    siteName: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!process.env.FIREBASE_PROJECT_ID) {
        reject(new Error('Firebase Project ID를 찾을 수 없습니다.'));
        return;
      }

      // Firebase 사이트 생성 (없으면)
      const createSite = spawn(
        'firebase',
        [
          'hosting:sites:create',
          siteName,
          '--project',
          process.env.FIREBASE_PROJECT_ID,
        ],
        { cwd: projectPath },
      );

      // 사이트 생성 스트림 핸들러
      const createSiteHandler = new ProcessStreamHandler(this.logger, {
        maxBufferLines: 200,
      });

      createSite.stdout.on('data', (data) =>
        createSiteHandler.handleStdout(data),
      );
      createSite.stderr.on('data', (data) =>
        createSiteHandler.handleStderr(data),
      );

      createSite.on('close', (code) => {
        this.logger.log(`Firebase 사이트 생성 종료 (코드: ${code})`);

        // 사이트가 이미 존재하는 경우도 성공으로 처리
        if (code !== 0) {
          const errorSummary = createSiteHandler.getErrorSummary();
          if (!errorSummary.includes('already exists')) {
            reject(
              new Error(
                `Firebase 사이트 생성 실패 (종료 코드: ${code})\n\n` +
                `에러: ${errorSummary}`,
              ),
            );
            return;
          }
        }

        // 배포 실행
        const deploy = spawn(
          'firebase',
          [
            'deploy',
            '--only',
            `hosting:${siteName}`,
            '--project',
            process.env.FIREBASE_PROJECT_ID!,
          ],
          {
            cwd: projectPath,
            timeout: 5 * 60 * 1000,
          },
        );

        // 배포 스트림 핸들러
        const deployHandler = new ProcessStreamHandler(this.logger, {
          maxBufferLines: 200,
        });

        deploy.stdout.on('data', (data) => deployHandler.handleStdout(data));
        deploy.stderr.on('data', (data) => deployHandler.handleStderr(data));

        deploy.on('close', (code) => {
          this.logger.log(`Firebase 배포 종료 (코드: ${code})`);

          if (code === 0) {
            resolve();
          } else {
            reject(
              new Error(
                `Firebase 배포 실패 (종료 코드: ${code})\n\n` +
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

      createSite.on('error', (error) => {
        this.logger.error(
          `Firebase 사이트 생성 프로세스 에러: ${error.message}`,
        );
        reject(
          new Error(
            `Firebase 사이트 생성 프로세스 실행 실패: ${error.message}\n` +
            `가능한 원인:\n` +
            `- Firebase CLI가 설치되지 않음\n` +
            `- Firebase 인증 실패`,
          ),
        );
      });
    });
  }
}
