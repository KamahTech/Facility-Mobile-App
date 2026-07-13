import React from "react";
import { View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack, type Href } from "expo-router";
import { router } from "@/lib/navigation";
import { useAppInsets } from "@/hooks/use-app-insets";
import { LegendList } from "@legendapp/list/react-native";

import { ScreenHeader } from "@/components/screen-header";
import { ActionCard } from "@/components/action-card";
import { AppButton } from "@/components/app-button";
import { serviceItems } from "@/constants/services";
import { useI18n } from "@/hooks/use-i18n";
import { useTheme } from "@/hooks/use-theme";
import { useThemeToken } from "@/hooks/use-theme-token";
import { useUnitStore } from "@/stores/unit-store";

export default function RequestServiceScreen() {
  const { isRTL, t } = useI18n();
  const { resolvedTheme } = useTheme();
  const background = useThemeToken("--background");
  const insets = useAppInsets();
  const { units } = useUnitStore();

  const services = React.useMemo(() => {
    return serviceItems.map((item) => ({
      id: item.id,
      title: t(item.titleKey),
      description: t(item.descriptionKey),
      icon: item.icon,
    }));
  }, [t]);

  const handleSelectService = (id: string) => {
    router.push(`/home/create-request?category=${id}` as Href);
  };

  const renderHeader = () => (
    <Text
      className="text-base leading-6 text-muted-foreground mb-6"
      style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
    >
      {t("services.description")}
    </Text>
  );

  const renderItem = ({
    item,
  }: {
    item: { id: string; title: string; description: string; icon: any };
  }) => (
    <View className="mb-4">
      <ActionCard
        title={item.title}
        description={item.description}
        icon={item.icon}
        onPress={() => handleSelectService(item.id)}
      />
    </View>
  );

  return (
    <View
      className="flex-1 bg-background"
      style={{
        paddingTop: insets.top,
        paddingStart: insets.left,
        paddingEnd: insets.right,
      }}
    >
      <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} />
      <View
        style={{
          height: insets.top,
          backgroundColor: background,
          position: "absolute",
          top: 0,
          start: 0,
          end: 0,
          zIndex: 100,
         }}
      />
      <Stack.Screen options={{ headerShown: false }} />

      <ScreenHeader
        title={t("services.title")}
        onBack={() => router.back()}
      />

      {units.length === 0 ? (
        <View className="flex-1 w-full max-w-xl self-center px-5 justify-center items-center py-12">
          <Text
            className="text-base text-muted-foreground text-center mb-6 leading-6"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {t("connectUnit.noUnits")}
          </Text>
          <AppButton
            label={t("connectUnit.addBtn")}
            onPress={() => router.push("/home/connect-unit")}
            className="w-full"
          />
        </View>
      ) : (
        <LegendList
          data={services}
          recycleItems={true}
          estimatedItemSize={120}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 24,
            paddingBottom: insets.bottom + 40,
            paddingHorizontal: 20,
          }}
          className="flex-1 w-full max-w-xl self-center"
        />
      )}
    </View>
  );
}

