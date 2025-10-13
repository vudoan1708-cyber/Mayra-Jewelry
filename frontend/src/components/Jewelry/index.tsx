// import Filter from './Filter';
import WeddingRingSection from './WeddingRingSection';
import BestSeller from './BestSeller';
import FeatureCollections from './FeatureCollections';

export default async function Jewelry() {
  return (
    <section className="flex flex-col">
      {/* <Filter /> */}

      <div className="text-5xl mt-4">
        <h3 className="px-6 py-4 text-brand-500 font-medium text-center">Hàng bán chạy nhất</h3>
        <BestSeller />
      </div>

      <WeddingRingSection />

      <div className="text-3xl">
        <h3 className="px-6 py-3 font-medium text-brand-500">Bộ sưu tập nổi bật trong năm</h3>
        <FeatureCollections />
      </div>
    </section>
  );
}
