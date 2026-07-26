import React from "react";
import { useLocalSearchParams } from "expo-router";
import { router } from "@/lib/navigation";
import { RelatedDocumentsView } from "@/components/related-documents-view";

export default function TicketRelatedDocumentsScreen() {
  const params = useLocalSearchParams();
  const id = params.id as string;

  return (
    <RelatedDocumentsView
      ticketId={id}
      accountType="resident"
      onBack={() => router.back()}
    />
  );
}
