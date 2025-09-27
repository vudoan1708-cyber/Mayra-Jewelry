import { LayoutGroup } from 'framer-motion';

import Navigation from '../components/Navigation';
import Bio from '../components/Bio';

import './page.css';

function App() {
  return (
    <LayoutGroup>
      <Navigation />
      <Bio />
    </LayoutGroup>
  )
}

export default App
