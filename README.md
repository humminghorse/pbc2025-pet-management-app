# Pet Management App

フルスタックのペット管理アプリケーション。Next.js (App Router)、TypeScript、Tailwind CSS、shadcn-ui、Prisma、Supabaseを使用して構築されています。

## 🎯 機能

- **認証**: Supabase Authによるメール/パスワード認証
- **ペット管理**: ペット情報のCRUD操作（作成・閲覧・更新・削除）
- **画像アップロード**: Supabase Storageを使用した画像保存
- **レスポンシブUI**: Tailwind CSSとshadcn-uiコンポーネントによる美しいUI

## 📦 技術スタック

- **フロントエンド**: Next.js 14 (App Router), React 18, TypeScript
- **スタイリング**: Tailwind CSS, shadcn-ui
- **バックエンド**: Next.js Route Handlers
- **データベース**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **認証**: Supabase Auth
- **ストレージ**: Supabase Storage
- **バリデーション**: Zod, React Hook Form
- **デプロイ**: Vercel

## 🚀 ローカル開発のセットアップ

### 前提条件

- Node.js 18以上
- npm または yarn
- Supabaseアカウント

### 1. リポジトリのクローン

\`\`\`bash
git clone <your-repo-url>
cd pet-management-app
\`\`\`

### 2. パッケージのインストール

\`\`\`bash
npm install
\`\`\`

### 3. Supabaseプロジェクトのセットアップ

1. [Supabase](https://supabase.com/)にアクセスし、新しいプロジェクトを作成
2. プロジェクトダッシュボードから以下の情報を取得:
   - Project URL
   - anon (public) key
   - service_role key
   - Database URL

### 4. 環境変数の設定

\`.env.local\` ファイルをプロジェクトルートに作成:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database (Supabase PostgreSQL URL)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 5. データベースのマイグレーション

\`\`\`bash
# Prisma Clientの生成
npx prisma generate

# データベースマイグレーション
npx prisma migrate dev --name init

# (オプション) Prisma Studioでデータベースを確認
npx prisma studio
\`\`\`

### 6. 開発サーバーの起動

\`\`\`bash
npm run dev
\`\`\`

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認できます。

## 📝 利用可能なスクリプト

- \`npm run dev\` - 開発サーバーを起動
- \`npm run build\` - 本番用ビルド
- \`npm run start\` - 本番サーバーを起動
- \`npm run lint\` - ESLintでコードをチェック
- \`npm run format\` - Prettierでコードをフォーマット
- \`npm run prisma:generate\` - Prisma Clientを生成
- \`npm run prisma:migrate\` - データベースマイグレーションを実行
- \`npm run prisma:studio\` - Prisma Studioを起動

## 🌐 Vercelへのデプロイ

### 1. Vercelプロジェクトの作成

1. [Vercel](https://vercel.com/)にログイン
2. "Add New Project"をクリック
3. GitHubリポジトリをインポート

### 2. 環境変数の設定

Vercelプロジェクトの設定で以下の環境変数を追加:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
DIRECT_URL
NEXT_PUBLIC_APP_URL (your-app.vercel.app)
\`\`\`

### 3. ビルド設定

- **Framework Preset**: Next.js
- **Build Command**: \`npm run build\`
- **Output Directory**: \`.next\`
- **Install Command**: \`npm install\`

### 4. デプロイ

"Deploy"ボタンをクリックしてデプロイを開始します。

### 5. データベースマイグレーション

初回デプロイ後、以下のコマンドをローカルで実行してデータベースをセットアップ:

\`\`\`bash
npx prisma migrate deploy
\`\`\`

## 📂 プロジェクト構成

\`\`\`
pet-management-app/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   └── my-pets/
│   │       ├── page.tsx
│   │       ├── add/
│   │       └── [id]/
│   ├── api/
│   │   ├── auth/
│   │   └── pets/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   ├── navbar.tsx
│   ├── pet-card.tsx
│   ├── pet-form.tsx
│   └── delete-pet-dialog.tsx
├── lib/
│   ├── prisma.ts
│   ├── supabase/
│   └── utils.ts
├── prisma/
│   └── schema.prisma
├── types/
│   └── index.ts
└── middleware.ts
\`\`\`

## 🔒 認証フロー

1. ユーザーがサインアップ
2. Supabaseが確認メールを送信
3. ユーザーがメール内のリンクをクリックして確認
4. ユーザーがログイン
5. ミドルウェアがセッションを確認し、保護されたルートへのアクセスを制御

## 🗄️ データベーススキーマ

\`\`\`prisma
model Pet {
  id        String    @id @default(uuid())
  ownerId   String
  name      String
  category  String
  breed     String?
  birthday  DateTime?
  gender    String?
  imageUrl  String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([ownerId])
}
\`\`\`

## 🎨 UI コンポーネント

このプロジェクトでは以下のshadcn-uiコンポーネントを使用しています:

- Button
- Card
- Input
- Label
- Form
- Avatar
- Alert Dialog
- Select
- Radio Group

## 🚧 トラブルシューティング

### Prismaエラー

Prismaでエラーが発生した場合:

\`\`\`bash
npx prisma generate
npx prisma migrate reset
\`\`\`

### Supabase接続エラー

- 環境変数が正しく設定されているか確認
- Supabaseプロジェクトが実行中か確認
- データベースURLが正しいか確認

### ビルドエラー

\`\`\`bash
rm -rf .next
npm run build
\`\`\`

## 📄 ライセンス

MIT

## 👤 作成者

Pet Management App - フルスタック ペット管理アプリケーション
