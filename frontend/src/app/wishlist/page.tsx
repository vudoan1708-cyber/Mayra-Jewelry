import UserSessionWrapper from './UserSessionWrapper';
import DisplayWishlist from './DisplayWishlist';

export default function Page() {
  return (
    <UserSessionWrapper>
      <DisplayWishlist />
    </UserSessionWrapper>
  );
}
