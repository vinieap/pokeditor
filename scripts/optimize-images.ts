#!/usr/bin/env node
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface OptimizationConfig {
  sizes: number[];
  formats: ('webp' | 'png' | 'avif')[];
  quality: {
    webp: number;
    png: number;
    avif: number;
  };
}

const config: OptimizationConfig = {
  sizes: [48, 96, 192],
  formats: ['webp', 'avif', 'png'],
  quality: {
    webp: 85,
    png: 90,
    avif: 80
  }
};

interface SpriteSheetConfig {
  columns: number;
  spriteSize: number;
  padding: number;
}

const spriteSheetConfig: SpriteSheetConfig = {
  columns: 20,
  spriteSize: 48,
  padding: 2
};

async function optimizeSprite(
  inputPath: string,
  outputDir: string,
  filename: string
): Promise<void> {
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  
  for (const size of config.sizes) {
    for (const format of config.formats) {
      const outputPath = path.join(
        outputDir,
        `${size}`,
        format,
        `${filename}.${format}`
      );
      
      const outputDirPath = path.dirname(outputPath);
      if (!fs.existsSync(outputDirPath)) {
        fs.mkdirSync(outputDirPath, { recursive: true });
      }
      
      let pipeline = sharp(inputPath).resize(size, size, {
        kernel: sharp.kernel.lanczos3,
        withoutEnlargement: false
      });
      
      switch (format) {
        case 'webp':
          pipeline = pipeline.webp({ quality: config.quality.webp });
          break;
        case 'avif':
          pipeline = pipeline.avif({ quality: config.quality.avif });
          break;
        case 'png':
          pipeline = pipeline.png({
            quality: config.quality.png,
            compressionLevel: 9,
            palette: true
          });
          break;
      }
      
      await pipeline.toFile(outputPath);
    }
  }
}

async function createSpriteSheet(
  sprites: { path: string; id: string }[],
  outputPath: string,
  sheetConfig: SpriteSheetConfig
): Promise<void> {
  const { columns, spriteSize, padding } = sheetConfig;
  const rows = Math.ceil(sprites.length / columns);
  
  const width = columns * (spriteSize + padding) - padding;
  const height = rows * (spriteSize + padding) - padding;
  
  const composites: sharp.OverlayOptions[] = [];
  
  for (let i = 0; i < sprites.length; i++) {
    const row = Math.floor(i / columns);
    const col = i % columns;
    
    const x = col * (spriteSize + padding);
    const y = row * (spriteSize + padding);
    
    const spriteBuffer = await sharp(sprites[i].path)
      .resize(spriteSize, spriteSize)
      .toBuffer();
    
    composites.push({
      input: spriteBuffer,
      top: y,
      left: x
    });
  }
  
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite(composites)
    .webp({ quality: 90 })
    .toFile(outputPath);
  
  const mapPath = outputPath.replace('.webp', '.json');
  const spriteMap: Record<string, { x: number; y: number; width: number; height: number }> = {};
  
  for (let i = 0; i < sprites.length; i++) {
    const row = Math.floor(i / columns);
    const col = i % columns;
    
    spriteMap[sprites[i].id] = {
      x: col * (spriteSize + padding),
      y: row * (spriteSize + padding),
      width: spriteSize,
      height: spriteSize
    };
  }
  
  fs.writeFileSync(mapPath, JSON.stringify(spriteMap, null, 2));
}

async function generateResponsiveSpriteComponent() {
  const componentCode = `import { useState, useEffect, useRef } from 'react';

interface SpriteImageProps {
  id: string;
  alt: string;
  size?: 48 | 96 | 192;
  loading?: 'lazy' | 'eager';
  fallback?: string;
  className?: string;
}

export function ResponsiveSpriteImage({
  id,
  alt,
  size = 96,
  loading = 'lazy',
  fallback = '/sprites/unknown.png',
  className = ''
}: SpriteImageProps) {
  const [error, setError] = useState(false);
  const [isInView, setIsInView] = useState(loading === 'eager');
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    if (loading === 'eager' || !('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, [loading]);
  
  if (error) {
    return (
      <img
        ref={imgRef}
        src={fallback}
        alt={alt}
        width={size}
        height={size}
        className={className}
      />
    );
  }
  
  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={\`\${className} sprite-skeleton\`}
        style={{ width: size, height: size }}
        aria-label={alt}
      />
    );
  }
  
  return (
    <picture>
      <source
        type="image/avif"
        srcSet={\`
          /sprites/optimized/\${size}/avif/\${id}.avif 1x,
          /sprites/optimized/\${size * 2}/avif/\${id}.avif 2x
        \`.trim()}
      />
      <source
        type="image/webp"
        srcSet={\`
          /sprites/optimized/\${size}/webp/\${id}.webp 1x,
          /sprites/optimized/\${size * 2}/webp/\${id}.webp 2x
        \`.trim()}
      />
      <img
        ref={imgRef}
        src={\`/sprites/optimized/\${size}/png/\${id}.png\`}
        srcSet={\`
          /sprites/optimized/\${size}/png/\${id}.png 1x,
          /sprites/optimized/\${size * 2}/png/\${id}.png 2x
        \`.trim()}
        alt={alt}
        width={size}
        height={size}
        loading={loading}
        onError={() => setError(true)}
        className={className}
      />
    </picture>
  );
}

interface SpriteFromSheetProps {
  sheetUrl: string;
  spriteMap: Record<string, { x: number; y: number; width: number; height: number }>;
  spriteId: string;
  alt: string;
  className?: string;
}

export function SpriteFromSheet({
  sheetUrl,
  spriteMap,
  spriteId,
  alt,
  className = ''
}: SpriteFromSheetProps) {
  const sprite = spriteMap[spriteId];
  
  if (!sprite) {
    return <img src="/sprites/unknown.png" alt={alt} className={className} />;
  }
  
  return (
    <div
      className={\`sprite-sheet-item \${className}\`}
      style={{
        width: sprite.width,
        height: sprite.height,
        backgroundImage: \`url(\${sheetUrl})\`,
        backgroundPosition: \`-\${sprite.x}px -\${sprite.y}px\`,
        backgroundSize: 'auto'
      }}
      role="img"
      aria-label={alt}
    />
  );
}
`;

  const outputPath = path.join(__dirname, '..', 'app', 'components', 'ResponsiveSpriteImage.tsx');
  fs.writeFileSync(outputPath, componentCode);
  console.log('✅ Generated ResponsiveSpriteImage component');
}

async function optimizeAllSprites() {
  const spritesDir = path.join(__dirname, '..', 'node_modules', 'pokemon-sprites', 'sprites');
  const outputDir = path.join(__dirname, '..', 'public', 'sprites', 'optimized');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log('🖼️  Starting sprite optimization...\n');
  
  const pokemonDir = path.join(spritesDir, 'pokemon');
  const itemsDir = path.join(spritesDir, 'items');
  
  const pokemonFiles = fs.readdirSync(pokemonDir)
    .filter(f => f.endsWith('.png'))
    .slice(0, 50);
  
  console.log(\`Processing \${pokemonFiles.length} Pokemon sprites...\`);
  
  for (const file of pokemonFiles) {
    const inputPath = path.join(pokemonDir, file);
    const filename = path.basename(file, '.png');
    
    await optimizeSprite(
      inputPath,
      path.join(outputDir, 'pokemon'),
      filename
    );
    
    process.stdout.write(\`.\`);
  }
  
  console.log(\`\n✅ Optimized \${pokemonFiles.length} Pokemon sprites\`);
  
  console.log('\nCreating sprite sheets for list views...');
  
  const firstGenSprites = pokemonFiles
    .slice(0, 20)
    .map(f => ({
      path: path.join(pokemonDir, f),
      id: path.basename(f, '.png')
    }));
  
  await createSpriteSheet(
    firstGenSprites,
    path.join(outputDir, 'sheets', 'pokemon-gen1.webp'),
    spriteSheetConfig
  );
  
  console.log('✅ Created sprite sheet for Generation 1');
  
  await generateResponsiveSpriteComponent();
  
  console.log('\n✨ Image optimization complete!');
  console.log(\`📁 Output directory: \${outputDir}\`);
}

optimizeAllSprites().catch(console.error);