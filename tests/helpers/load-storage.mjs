import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

export async function loadStorage(fetchImpl = async () => Response.json({})) {
  const context = vm.createContext({ URL, Headers, FormData, Response, fetch: fetchImpl, window: { location: { origin: 'https://frontend.test', hostname: 'frontend.test' } } });
  const modules = new Map();
  async function load(filename) {
    if (modules.has(filename)) return modules.get(filename);
    if (filename.endsWith('auth.service.ts')) {
      const auth = new vm.SyntheticModule(['getAccessToken'], function () { this.setExport('getAccessToken', () => 'storage-test-token'); }, { context });
      modules.set(filename, auth); return auth;
    }
    const source = await readFile(filename, 'utf8');
    const code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext } }).outputText;
    const module = new vm.SourceTextModule(code, { context, identifier: filename, initializeImportMeta(meta) { meta.env = { VITE_API_URL: 'https://api.test', DEV: false }; } });
    modules.set(filename, module);
    await module.link(specifier => load(resolve(dirname(filename), `${specifier}.ts`)));
    return module;
  }
  const service = await load(resolve('src/services/storage.service.ts')); await service.evaluate();
  const presentation = await load(resolve('src/admin/utils/storage.ts')); await presentation.evaluate();
  const hosting = await load(resolve('src/services/hosting.service.ts')); await hosting.evaluate();
  const hostingPresentation = await load(resolve('src/admin/utils/hosting.ts')); await hostingPresentation.evaluate();
  return { service: service.namespace, presentation: presentation.namespace, hosting: hosting.namespace, hostingPresentation: hostingPresentation.namespace };
}
