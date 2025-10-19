import SelectProvider from './SelectProvider';
import { auth } from '../auth';
import { getOrdersByBuyerId } from '../../server/data';

export default async function Page() {
  const session = await auth();

  const orders = await getOrdersByBuyerId(session?.user?.id ?? window.btoa(session?.user?.email ?? ''));
  return <SelectProvider session={session} orders={orders} />;
}
