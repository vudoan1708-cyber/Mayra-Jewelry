import fs from 'fs';
import path from 'path';

import Image from 'next/image';

import Grid from './Grid';
import Filter from './Filter';

export default function Jewelry() {
  const pathToImagesDir = path.resolve(__dirname, '..', '..', '..', 'public/images/jewelry');
  const images = fs.readdirSync(pathToImagesDir);
  return (
    <section className="flex gap-2 items-start">
      <Filter />
      <Grid>
        {images.map((img, idx) => (
          <Image
            src={`/images/jewelry/${img}`}
            alt={img}
            key={idx}
            width="450"
            height="450"
            style={{ objectFit: "contain", width: "auto", height: "auto" }} />
        ))}
      </Grid>
    </section>
  );
}
