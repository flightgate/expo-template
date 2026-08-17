# flightgate-webview-template

Template Expo usado pelo Flightgate pra empacotar um site já publicado (ex: um projeto Lovable) como app nativo — feature **Website Wrapper** (`source_type: hosted_url`). Ver [`packages/specs/features/website-wrapper.md`](https://github.com/flightgate/flightgate/blob/main/packages/specs/features/website-wrapper.md) no monorepo principal pro spec completo.

## Como o Flightgate usa este repositório

A cada deployment de uma application `hosted_url`, o runner:

1. Clona este repositório (branch padrão configurado via `WEBVIEW_TEMPLATE_REPOSITORY` no Flightgate)
2. Sobrescreve `webview.config.json` (raiz do projeto) com `{"url": "<site_url do usuário>"}`
3. Sobrescreve `assets/icon.png` e `assets/adaptive-icon.png` com o ícone enviado pelo usuário
4. Roda `pnpm install` e `expo prebuild --platform <ios|android> --clean`
5. Builda nativamente (`xcodebuild`/`gradlew bundleRelease`) — mesmo pipeline usado pra applications `git_repository`

Esse fluxo é implementado em `execute-deployment-use-case.ts` (`injectWebsiteWrapperAssets`) no `packages/runner` do monorepo principal — não precisa mexer neste repositório pra isso funcionar, só manter o contrato abaixo.

## Contrato que este repositório precisa manter

- **`webview.config.json`** na raiz, formato `{"url": string}` — `app/index.tsx` lê esse arquivo (`import webviewConfig from '../webview.config.json'`). Se o caminho ou o formato mudar, atualizar `injectWebsiteWrapperAssets` no runner junto.
- **`assets/icon.png`** e **`assets/adaptive-icon.png`** — precisam existir com esses nomes exatos (1024×1024, PNG). São sobrescritos antes do `expo prebuild`, que gera as resoluções nativas a partir deles.
- **Managed workflow do Expo** — nunca commitar `ios/`/`android/` gerados (`expo prebuild` roda a cada deploy). Ver `.gitignore`.

## Rodando localmente

```bash
pnpm install
pnpm start
```

Edite `webview.config.json` localmente pra testar com uma URL diferente (esse arquivo é sobrescrito em produção, não é config de verdade — é só o fallback de desenvolvimento).

## Escalabilidade futura (fora do escopo da v1)

Este template hoje só faz WebView simples — sem push notifications, deep links ou acesso a câmera. Como é um projeto Expo normal, esses recursos podem ser adicionados aqui depois sem exigir mudança de arquitetura no Flightgate (ver nota em `website-wrapper.md`).
