import fs from 'fs';
import path from 'path';

import Grid from './Grid';
import Filter from './Filter';
import GridItem from './GridItem';
import WeddingRingSection from './WeddingRingSection';

const pathToImagesDir = path.resolve(__dirname, '..', '..', '..', 'public/images/jewelry');
const images = fs.readdirSync(pathToImagesDir);

export default function Jewelry() {
  const isFeatured = images.filter((img) => img.endsWith('jpg'));
  const bestSeller = images.filter((img) => /boxed_ring.webp/.test(img));
  return (
    <section className="flex flex-col">
      {/* <Filter /> */}

      <div className="text-5xl mt-4">
        <h3 className="px-6 py-4 text-brand-500 font-medium text-center">Hàng bán chạy nhất</h3>
        <Grid>
          {bestSeller.map((img, idx) => (
            <GridItem key={`best-seller-${idx}`} img={img}>
              <div>
                <b className="text-lg text-gray-800">Mayra Collection</b>
                <p className="font-light">{img}</p>
              </div>
              <b>300,000₫</b>
            </GridItem>
          ))}
        </Grid>
      </div>

      <WeddingRingSection />

      <div className="text-3xl">
        <h3 className="px-6 py-3 font-medium text-brand-500">Bộ sưu tập nổi bật trong năm</h3>
        <Grid>
          {isFeatured.map((img, idx) => <GridItem key={`featured-${idx}`} img={img} />)}
        </Grid>
      </div>
    </section>
  );
}
