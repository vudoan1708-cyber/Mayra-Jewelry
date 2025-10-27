// import Filter from './Filter';
import BestSeller from './BestSeller';
import FeatureCollections from './FeatureCollections';

export default async function Jewelry() {
  return (
    <section className="flex flex-col">
      {/* <Filter /> */}

      <div className="text-5xl mt-4 h-dvh">
        {/* <h3 className="px-6 py-4 text-brand-500 font-medium text-center">Hàng bán chạy nhất</h3> */}
        <BestSeller />
      </div>

      <div className="text-3xl h-dvh">
        <h3 className="px-6 py-3 font-medium text-brand-500">Bộ sưu tập nổi bật trong năm</h3>
        <FeatureCollections />
      </div>
    </section>
  );
}
