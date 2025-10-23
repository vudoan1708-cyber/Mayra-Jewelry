import SelectProvider from './SelectProvider';
import { auth } from '../auth';
import { getOrdersByBuyerId } from '../../server/data';
import { userIdOrBase64Email } from '../../helpers';

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const [session, params] = await Promise.all([auth(), searchParams]);

  const buyerId = userIdOrBase64Email(session?.user);
  const orders = buyerId ? await getOrdersByBuyerId(userIdOrBase64Email(session?.user)) : undefined;
  return <SelectProvider session={session} orders={orders} autoSignIn={params.autoSignin === 'true'} redirection={params.from} />;
}
