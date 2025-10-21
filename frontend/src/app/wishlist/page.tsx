import DisplayWishlist from './DisplayWishlist';
import { auth } from '../auth';
import { getBuyerWishlist } from '../../server/data';
import { userIdOrBase64Email } from '../../helpers';

export default async function Page({ searchParams }: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const session = await auth();
  const buyerId = userIdOrBase64Email(session?.user);
  const wishlistItems = buyerId ? await getBuyerWishlist(buyerId) : [];

  const params = await searchParams;
  const from = params.from;
  return (
    <DisplayWishlist from={from} wishlistItems={wishlistItems} />
  );
}
