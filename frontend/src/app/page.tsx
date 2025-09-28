import { LayoutGroup } from 'framer-motion';

import Bio from '../components/Bio';
import Jewelry from '../components/Jewelry';

function App() {
  return (
    <LayoutGroup>
      <Bio />
      <Jewelry />
    </LayoutGroup>
  )
}

export default App;
