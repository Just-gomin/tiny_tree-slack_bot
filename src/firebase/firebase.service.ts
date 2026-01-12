import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FirebaseService {
  async deploy(projectPath: string, siteName: string): Promise<string> {
    // firebase.json 생성
    await this.createFirebaseConfig(projectPath);

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
      if (!process.env.FIREBASE_PROJECT_ID)
        reject(new Error('Firebase Project ID를 찾을 수 없습니다.'));

      // Firebase 사이트 생성 (없으면)
      const createSite = spawn(
        'firebase',
        [
          'hosting:sites:create',
          siteName,
          '--project',
          process.env.FIREBASE_PROJECT_ID!,
        ],
        { cwd: projectPath },
      );

      createSite.on('close', () => {
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

        deploy.on('close', (code) => {
          if (code === 0) resolve();
          else reject(new Error(`Firebase 배포 실패: ${code}`));
        });
      });
    });
  }
}
