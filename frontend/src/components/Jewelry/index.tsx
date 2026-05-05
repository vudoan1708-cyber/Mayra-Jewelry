import { getTranslations } from 'next-intl/server';

// import Filter from './Filter';
import BestSeller from './BestSeller';
import FeatureCollections from './FeatureCollections';

export default async function Jewelry() {
  const t = await getTranslations('jewelry');
  return (
    <section className="flex flex-col">
      {/* <Filter /> */}

      <div className="text-5xl mt-4 h-dvh">
        <BestSeller />
      </div>

      <div className="text-3xl h-dvh">
        <h3 className="px-6 py-3 font-medium text-brand-500">{t('featuredHeading')}</h3>
        <FeatureCollections />
      </div>
    </section>
  );
}
