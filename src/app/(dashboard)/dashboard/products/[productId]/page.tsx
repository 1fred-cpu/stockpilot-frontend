import ProductDetailsPage from "@/components/ProductDetailsPage";

export default async function ProductDetails({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const resolvedParams = await params;
  return <ProductDetailsPage productId={resolvedParams.productId} />;
}
