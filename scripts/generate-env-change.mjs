#!/usr/bin/env zx

/* eslint-disable no-undef */

import dotenv from 'dotenv';

const envVarTemplate = (key, env) => `
- name: ${key}
  valueFrom:
    secretKeyRef:
      name: ${env}
      key: ${key}`;

const contextTemplate = (name, content) => `
###################################################
# ${name} 
###################################################

${content}

`;

const envSecretTemplate = (key, value) => `
${key}: ${Buffer.from(value).toString('base64')}`;

const dotenvTemplate = (key, value) => `
${key.trim()}=${value.trim()}`;

const getEnvKeysFromFile = (filePath = './.env.example') => {
  const envPath = path.resolve(filePath);
  const env = dotenv.parse(fs.readFileSync(envPath, 'utf8'));

  return Object.fromEntries(Object.entries(env || {}).filter(([key]) => !key.startsWith('LOCAL_')));
};

const printK8sVars = (env, envName) => {
  console.log(contextTemplate(`K8s Deployment: ${envName}`, getK8sVarsContent(env, envName)));
};

const printEnvSecrets = (env) => {
  console.log(contextTemplate('Secrets', getEnvSecretsContent(env)));
};

const printDotEnv = (env) => {
  console.log(contextTemplate('DotEnv File', getDotenvContent(env)));
};

const printSummary = (env, envName, envFile) => {
  const keyCount = Object.keys(env).length;

  const content = `
  Source: ${envFile}
  Environment: ${envName}
  Keys: ${keyCount}

###################################################
`;

  console.log(contextTemplate('Summary', content));
};

const persistChanges = (env, envName, basePath) => {
    const summaryPath = path.resolve(path.join(basePath, `summary.md`));
    const k8sPath = path.resolve(path.join(basePath, `vars.yaml`));
    const dotenvPath = path.resolve(path.join(basePath, `.env.example`));
    const secretPath = path.resolve(path.join(basePath, `secret.yaml`));

    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
    }

    fs.writeFileSync(k8sPath, getK8sVarsContent(env, envName), 'utf8');
    fs.writeFileSync(dotenvPath, getDotenvContent(env), 'utf8');
    fs.writeFileSync(secretPath, getEnvSecretsContent(env), 'utf8');

    const summary = `
# Environment: ${envName}
# Path: ${basePath}
# Keys: ${Object.keys(env).length}

${Object.keys(env)
  .map((key) => `- ${key}`)
  .join('\n')}
`;

  fs.writeFileSync(summaryPath, summary, 'utf8');
};

const run = () => {
  const envName = 'pixwayid-backend-env';
  const envFile = './.env.example';
  const env = getEnvKeysFromFile(envFile);
  const arg = process.argv[3];

  if (arg === '--print') {
    printSummary(env, envName, envFile);
    printK8sVars(env, envName);
    printDotEnv(env);
    printEnvSecrets(env);
  }

  persistChanges(env, envName, './infra/generated');

  return 0;
};

await run();

function getK8sVarsContent(env, envName) {
  return Object.keys(env)
    .sort()
    .map((envKey) => {
      return envVarTemplate(envKey, envName);
    })
    .join('');
}

function getDotenvContent(env) {
  return Object.entries(env)
    .sort()
    .map(([envKey, envValue]) => {
      return dotenvTemplate(envKey, envValue);
    })
    .join('');
}

function getEnvSecretsContent(env) {
  return Object.entries(env)
    .sort()
    .map(([envKey, envValue]) => {
      return envSecretTemplate(envKey, envValue);
    })
    .join('');
}