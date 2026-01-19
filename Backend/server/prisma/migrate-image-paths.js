const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Scanning products for image path normalization...');

  const products = await prisma.product.findMany({});

  let updated = 0;

  for (const p of products) {
    if (!p.images || !Array.isArray(p.images) || p.images.length === 0) continue;

    const newImages = p.images.map((img) => {
      if (!img || typeof img !== 'string') return img;
      // preserve absolute URLs
      if (img.startsWith('http://') || img.startsWith('https://')) return img;
      // keep only filename for uploads paths
      // e.g. '/uploads/products/abc.webp' -> 'abc.webp'
      const lastSlash = img.lastIndexOf('/');
      if (lastSlash === -1) return img;
      return img.slice(lastSlash + 1);
    });

    // compare and update only if different
    const equal = JSON.stringify(newImages) === JSON.stringify(p.images);
    if (!equal) {
      await prisma.product.update({ where: { id: p.id }, data: { images: newImages } });
      updated++;
      console.log(`Updated product ${p.id}:`, p.images, '→', newImages);
    }
  }

  console.log(`Done. Updated ${updated} products.`);
}

main()
  .catch((e) => {
    console.error('Migration failed', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
