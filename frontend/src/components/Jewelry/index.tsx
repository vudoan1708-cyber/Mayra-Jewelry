import fs from 'fs';
import path from 'path';

import Grid from './Grid';
import Filter from './Filter';
import GridItem from './GridItem';

const pathToImagesDir = path.resolve(__dirname, '..', '..', '..', 'public/images/jewelry');
const images = fs.readdirSync(pathToImagesDir);

export default function Jewelry() {
  return (
    <section className="flex flex-col">
      <Filter />
      <Grid>
        {images.map((img, idx) => (
          <GridItem key={idx} index={idx} img={img} />
        ))}
      </Grid>
    </section>
  );
}
