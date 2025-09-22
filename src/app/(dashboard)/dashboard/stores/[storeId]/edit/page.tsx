import StoreDetailsPage from "@/components/StoreDetailsPage";
import React from "react";

export default async function StoreDetails({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const storeId = (await params).storeId;
  return <StoreDetailsPage id={storeId} />;
}
