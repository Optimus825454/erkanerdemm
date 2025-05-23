blog-media-project
├── src
│   ├── components
│   │   ├── media
│   │   │   ├── ImageUploader.tsx
│   │   │   ├── ImageOptimizer.tsx
│   │   │   └── VideoPlayer.tsx
│   │   └── categories
│   │       ├── CategoryList.tsx
│   │       └── CategorySelector.tsx
│   ├── lib
│   │   ├── imageProcessing
│   │   │   ├── compress.ts
│   │   │   ├── resize.ts
│   │   │   └── optimize.ts
│   │   └── categories
│   │       └── helpers.ts
│   ├── types
│   │   ├── media.ts
│   │   └── categories.ts
│   ├── pages
│   │   ├── api
│   │   │   ├── media
│   │   │   │   ├── upload.ts
│   │   │   │   └── optimize.ts
│   │   │   └── categories
│   │   │       ├── create.ts
│   │   │       └── list.ts
│   │   └── admin
│   │       └── media-manager.tsx
├── prisma
│   └── schema.prisma
├── package.json
├── tsconfig.json
└── README.md