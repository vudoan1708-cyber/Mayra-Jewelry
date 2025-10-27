import { LayoutGroup } from 'framer-motion';

import Bio from '../components/Bio';
import Jewelry from '../components/Jewelry';
import ClothBackground from '../components/Background/ClothBackground';

function App() {
  return (
    <LayoutGroup>
      <ClothBackground />
      <Bio />
      <Jewelry />
    </LayoutGroup>
  )
}

export default App;
