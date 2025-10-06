import fs from 'fs';
import path from 'path';

import Grid from './Grid';
import Filter from './Filter';
import GridItem from './GridItem';

const pathToImagesDir = path.resolve(__dirname, '..', '..', '..', 'public/images/jewelry');
const images = fs.readdirSync(pathToImagesDir);

export default function Jewelry() {
  const isFeatured = images.slice(1, 4);
  const bestSeller = images.slice(images.length - 4, images.length - 2);
  return (
    <section className="flex flex-col">
      <Filter />
      <div className="mt-3 text-3xl">
        <h3 className="p-6">Bộ sưu tập nổi bật trong năm</h3>
        <Grid>
          {isFeatured.map((img, idx) => <GridItem key={`featured-${idx}`} idx={idx} img={img} />)}
        </Grid>
      </div>

      <div className="mt-3 text-3xl">
        <h3 className="p-6">Hàng bán chạy nhất</h3>
        <Grid>
          {bestSeller.map((img, idx) => <GridItem key={`best-seller-${idx}`} idx={idx} img={img} />)}
        </Grid>
      </div>
      {/* <Grid>
        {images.map((img, idx) => (
          <GridItem key={idx.toString()} idx={idx} img={img} />
        ))}
      </Grid> */}
    </section>
  );
}
