export default async function Page({ params }: { params: Promise<{ encryptedEmailId: string }> }) {
  const { encryptedEmailId } = await params;
  console.log('encryptedEmailId', encryptedEmailId)
  return (
    <div className="self-center">This page is not done yet, but the button below should allow the merchant to trigger an endpoint from the Backend to approve a pending order</div>
  )
}
