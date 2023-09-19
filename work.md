# 一天サイト



## Next.js

https://zenn.dev/hungry_goat/articles/b7ea123eeaaa44

### create-next-app

```
D:\WORK\git\itten-web>npm create next-app --typescrip
√ What is your project named? ... itten-web-front

√ Would you like to use TypeScript? ... No / Yes
√ Would you like to use ESLint? ... No / Yes
√ Would you like to use Tailwind CSS? ... No / Yes
√ Would you like to use `src/` directory? ... No / Yes
√ Would you like to use App Router? (recommended) ... No / Yes
√ Would you like to customize the default import alias? ... No / Yes
√ What import alias would you like configured? ... @/*
Creating a new Next.js app in D:\WORK\git\itten-web\itten-web-front.

Using npm.

Initializing project with template: app-tw


Installing dependencies:
- react
- react-dom
- next
- typescript
- @types/react
- @types/node
- @types/react-dom
- tailwindcss
- postcss
- autoprefixer
- eslint
- eslint-config-next


added 328 packages, and audited 329 packages in 7s

117 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
Success! Created itten-web-front at D:\WORK\git\itten-web\itten-web-front
```



### Vercel

Vercelに

自動デプロイの制限
https://zenn.dev/bisque/scraps/50a51a28d6eb85



## 画像

**Image**で、高さ幅指定

### favicon

**/app**以下に `favicon.icon`を保存。自動でやってくれる

## 認証

Firebase Auth

https://zenn.dev/tentel/articles/cc76611f4010c9

### 準備

* Firebase adminのキーを取得
  * `/itten-web-firebase-adminsdk.json`
* Firebase SDKの準備
* ライブラリのインストール

#### ライブラリ

```
npm install firebase@9 # ブログに合わせるためにv9
npm install firebase-admin@11 # ブログに合わせるためv11
npm install next-auth
```

### Firebase周りの実装

https://zenn.dev/tentel/articles/cc76611f4010c9

↑のとおりに、クライアントコーンポーネント用とサーバーコンポーネント用に実装。



#### シークレットキーのJSONのデプロイ

T.B.D

### NextAuth

App Routerに対応させる。上のブログはハンドラーの実装が対応できていない。
以下を参考
https://qiita.com/kage1020/items/8224efd0f3557256c541











## LINEログイン

https://developers.line.biz/ja/docs/line-login/overview/#introduction

IDを取るときだけログインする方針に

