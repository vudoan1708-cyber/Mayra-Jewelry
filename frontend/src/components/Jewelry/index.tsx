import fs from 'fs';
import path from 'path';

import Image from 'next/image';

import Grid from './Grid';
import Filter from './Filter';

export default function Jewelry() {
  const pathToImagesDir = path.resolve(__dirname, '..', '..', '..', 'public/images/jewelry');
  const images = fs.readdirSync(pathToImagesDir);
  return (
    <section className="flex flex-col">
      <Filter />
      <Grid>
        {images.map((img, idx) => (
          <div className="relative" key={idx}>
            <figure className="h-80 overflow-hidden">
              <Image
                src={`/images/jewelry/${img}`}
                alt={img}
                width="450"
                height="320"
                style={{ objectFit: "contain", width: "auto", height: "auto" }}
                className="object-cover h-full w-full" />
              <figcaption className="absolute bottom-0 w-full bg-transparent-white flex justify-between items-center px-2 py-1">
                <div>
                  <b>Mayra Collection</b>
                  <p>{img}</p>
                </div>
                <b>300,000₫</b>
              </figcaption>
            </figure>
          </div>
        ))}
      </Grid>
    </section>
  );
}
