import fs from 'fs';
import path from 'path';

import Image from 'next/image';

import Grid from './Grid';
import Filter from './Filter';
import Variation, { type JewelryVariation } from './Variation';

export default function Jewelry() {
  const pathToImagesDir = path.resolve(__dirname, '..', '..', '..', 'public/images/jewelry');
  const images = fs.readdirSync(pathToImagesDir);

  const variations: Array<JewelryVariation> = [
    { key: 0, label: 'Bạc', style: 'bg-gray-400' },
    { key: 1, label: 'Vàng', style: 'bg-amber-300' },
    { key: 2, label: 'Vàng trắng', style: 'bg-slate-100' },
  ];
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
                  <div className="flex gap-2 items-center">
                    {variations.map((variation) => (
                      <Variation key={`${img}_${variation.key}`} variation={variation} />
                    ))}
                  </div>
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
