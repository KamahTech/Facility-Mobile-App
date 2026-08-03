import React from "react";
import { Pressable, View, Text, Linking } from "react-native";
import { AppIcon } from "@/components/app-icon";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeToken } from "@/hooks/use-theme-token";
import { API_BASE_URL } from "@/constants/api";
import { getSessionId } from "@/lib/api-client";
import * as WebBrowser from "expo-web-browser";
import type { AssetDocument } from "@/lib/api/asset-inspection";

interface AssetDocumentCardProps {
  document: AssetDocument;
  assetId: string;
}

export function AssetDocumentCard({ document: doc, assetId }: AssetDocumentCardProps) {
  const { t, isRTL } = useI18n();
  const mutedForeground = useThemeToken("--muted-foreground");
  const primaryColor = useThemeToken("--primary");

  const docTypeLabels: Record<string, string> = {
    manual: "assets.docType.manual",
    warranty: "assets.docType.warranty",
    certificate: "assets.docType.certificate",
    drawing: "assets.docType.drawing",
    other: "assets.docType.other",
  };

  const handleOpenDoc = async () => {
    try {
      const fullUrl = doc.contentUrl.startsWith("http")
        ? doc.contentUrl
        : `${API_BASE_URL.replace("/facility_mobile_api/v1", "")}${doc.contentUrl}`;
      const token = getSessionId();
      const authenticatedUrl = token
        ? `${fullUrl}${fullUrl.includes("?") ? "&" : "?"}access_token=${token}`
        : fullUrl;

      await WebBrowser.openBrowserAsync(authenticatedUrl);
    } catch {
      if (doc.contentUrl) {
        Linking.openURL(doc.contentUrl);
      }
    }
  };

  return (
    <Pressable
      onPress={handleOpenDoc}
      className="bg-card border border-border rounded-xl p-3 mb-2 flex-row items-center justify-between active:opacity-80"
    >
      <View className="flex-row items-center gap-3 flex-1 me-2">
        <View className="w-10 h-10 rounded-lg bg-primary/10 items-center justify-center">
          <AppIcon name="document" size={20} color={primaryColor} />
        </View>

        <View className="flex-1">
          <Text
            className="text-sm font-bold text-foreground"
            numberOfLines={1}
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {doc.name || doc.filename}
          </Text>
          <View className="flex-row items-center gap-2 mt-0.5">
            <Text
              className="text-xs font-medium text-primary"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {t((docTypeLabels[doc.type] || "assets.docType.other") as any)}
            </Text>
            {doc.date ? (
              <Text className="text-xs text-muted-foreground">• {doc.date}</Text>
            ) : null}
          </View>
        </View>
      </View>

      <AppIcon name="download" size={18} color={mutedForeground} />
    </Pressable>
  );
}
