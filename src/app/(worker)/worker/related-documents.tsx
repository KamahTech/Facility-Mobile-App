import React from "react";
import { useLocalSearchParams } from "expo-router";
import { router } from "@/lib/navigation";
import { RelatedDocumentsView } from "@/components/related-documents-view";

export default function WorkerRelatedDocumentsScreen() {
  const params = useLocalSearchParams();
  const id = params.id as string;

  return (
    <RelatedDocumentsView
      ticketId={id}
      accountType="worker"
      onBack={() => router.back()}
    />
  );
}
