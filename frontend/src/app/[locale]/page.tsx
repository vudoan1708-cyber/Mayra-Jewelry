import { LayoutGroup } from 'framer-motion';

import Bio from '../../components/Bio';
import QuickNav from '../../components/Home/QuickNav';
import HomeJewelCanvas from '../../components/Background/HomeJewelCanvas';

export default function Home() {
  return (
    <LayoutGroup>
      <HomeJewelCanvas />
      <Bio />
      <QuickNav />
    </LayoutGroup>
  );
}
