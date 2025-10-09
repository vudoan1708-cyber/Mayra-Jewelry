import fs from 'fs';
import path from 'path';

import Grid from './Grid';
import Filter from './Filter';
import GridItem from './GridItem';
import WeddingRingSection from './WeddingRingSection';

const pathToImagesDir = path.resolve(__dirname, '..', '..', '..', 'public/images/jewelry');
const images = fs.readdirSync(pathToImagesDir);

export default function Jewelry() {
  const isFeatured = images.slice(1, 4);
  const bestSeller = images.slice(images.length - 4, images.length - 2);
  return (
    <section className="flex flex-col">
      <Filter />

      <div className="mt-3 text-3xl">
        <h3 className="p-6 text-brand-700">Hàng bán chạy nhất</h3>
        <Grid>
          {bestSeller.map((img, idx) => <GridItem key={`best-seller-${idx}`} img={img}>
            <div>
              <b className="text-lg text-gray-800">Mayra Collection</b>
              <p className="font-light">{img}</p>
            </div>
            <b>300,000₫</b>
          </GridItem>)}
        </Grid>
      </div>
      <WeddingRingSection />

      <div className="mt-3 text-3xl">
        <h3 className="p-6 text-brand-700">Bộ sưu tập nổi bật trong năm</h3>
        <Grid>
          {isFeatured.map((img, idx) => <GridItem key={`featured-${idx}`} img={img} price />)}
        </Grid>
      </div>
    </section>
  );
}
