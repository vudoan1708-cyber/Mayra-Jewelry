import { auth } from '../auth';
import Cart from './Cart';

export default async function Page() {
  const session = await auth();
  
  return <Cart userId={session?.user?.id ?? ''} />
}
