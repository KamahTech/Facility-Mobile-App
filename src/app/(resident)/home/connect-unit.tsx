import React from "react";
import { Pressable, View, Alert, ActivityIndicator, RefreshControl, StyleSheet } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LegendList } from "@legendapp/list/react-native";

import { ScreenHeader } from "@/components/screen-header";
import { AppText } from "@/components/app-text";
import { AppButton } from "@/components/app-button";
import { AppIcon } from "@/components/app-icon";
import { ConnectedUnitCard } from "@/components/connected-unit-card";
import { FullScreenLoader } from "@/components/full-screen-loader";
import { useI18n } from "@/hooks/use-i18n";
import { useTheme } from "@/hooks/use-theme";
import { useThemeToken } from "@/hooks/use-theme-token";
import { useTransitionDelayedLoading } from "@/hooks/use-screen-transition";
import { useUnitStore } from "@/stores/unit-store";

export default function ConnectUnitScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { resolvedTheme } = useTheme();
  const { units, fetchUnits, disconnectUnit, loading, clearError } = useUnitStore();
  const mutedForeground = useThemeToken("--muted-foreground");

  const [actionLoading, setActionLoading] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const showInitialUnitsLoader = useTransitionDelayedLoading(loading && units.length === 0);

  const loadUnits = React.useCallback(async () => {
    clearError();
    await fetchUnits();
  }, [fetchUnits, clearError]);

  React.useEffect(() => {
    clearError();
  }, [clearError]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUnits();
    setRefreshing(false);
  };

  const handleDisconnect = async (id: string) => {
    Alert.alert(
      t("connectUnit.disconnectTitle"),
      t("connectUnit.disconnectConfirm"),
      [
        { text: t("actions.cancel"), style: "cancel" },
        {
          text: t("connectUnit.disconnect"),
          style: "destructive",
          onPress: async () => {
            setActionLoading(true);
            try {
              await disconnectUnit(id);
            } catch (e: unknown) {
              Alert.alert(t("common.error"), e instanceof Error ? e.message : t("errors.disconnectUnitFailed"));
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleAddPress = () => {
    router.push("/home/add-unit" as Href);
  };

  const headerRightAction = (
    <Pressable
      onPress={handleAddPress}
      accessibilityLabel={t("connectUnit.addBtn")}
      accessibilityRole="button"
      className="w-10 h-10 rounded-full bg-primary items-center justify-center active:opacity-75"
    >
      <AppIcon name="add" size={18} colorToken="--primary-foreground" />
    </Pressable>
  );

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} />

      {/* Adaptive Background Gradient */}
      <LinearGradient
        colors={
          resolvedTheme === "dark"
            ? ["#18181b", "#09090b", "#09090b"]
            : ["#ffffff", "#f5f6f8", "#f5f6f8"]
        }
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View
        className="flex-1"
        style={{
          paddingTop: insets.top,
          paddingStart: insets.left,
          paddingEnd: insets.right,
        }}
      >
        <ScreenHeader
          title={t("connectUnit.connectedTitle")}
          onBack={() => router.back()}
          rightAction={headerRightAction}
          showBorder={false}
        />

        <View className="flex-1 w-full max-w-xl self-center px-5">
          <FullScreenLoader visible={actionLoading} />

          <View className="flex-1">
            {loading && units.length === 0 ? (
              <View className="flex-1 items-center justify-center py-12">
                {showInitialUnitsLoader && <ActivityIndicator size="large" color="#4F46E5" />}
              </View>
            ) : units.length === 0 ? (
              <View className="flex-1 items-center justify-center py-12 px-6">
                <View className="w-16 h-16 rounded-full bg-secondary/50 items-center justify-center mb-4">
                  <AppIcon name="linkUnit" size={28} color={mutedForeground} />
                </View>
                <AppText align="center" className="text-base text-muted-foreground mb-8 leading-6">
                  {t("connectUnit.noUnits")}
                </AppText>
                <AppButton
                  label={t("connectUnit.addBtn")}
                  onPress={handleAddPress}
                  className="w-full"
                />
              </View>
            ) : (
              <View className="flex-1">
                <LegendList
                  data={units}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <ConnectedUnitCard unit={item} onDisconnect={handleDisconnect} />
                  )}
                  estimatedItemSize={100}
                  recycleItems={true}
                  showsVerticalScrollIndicator={false}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={handleRefresh}
                      tintColor="#4F46E5"
                    />
                  }
                  contentContainerStyle={{
                    paddingTop: 16,
                    paddingBottom: insets.bottom + 40,
                  }}
                  className="flex-1 w-full"
                />
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
