import React from "react";
import { Tabs } from "expo-router";
import { useWindowDimensions, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { PortalHost, PortalProvider } from "@gorhom/portal";

import { AnimatedTabBarButton } from "@/components/animated-tab-bar-button";
import { AppIcon } from "@/components/app-icon";
import { AppText } from "@/components/app-text";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeToken } from "@/hooks/use-theme-token";
import { ScrollAnimationProvider, useScrollAnimation } from "@/providers/scroll-animation-provider";
import { getDirectionalRowStyle } from "@/lib/i18n-layout";

function WorkerCollapsibleTabBar({ state, descriptors, navigation }: any) {
  const { tabBarTranslateY } = useScrollAnimation();
  const { direction } = useI18n();
  const { width } = useWindowDimensions();

  const card = useThemeToken("--card");
  const border = useThemeToken("--border");
  const foreground = useThemeToken("--foreground");
  const mutedForeground = useThemeToken("--muted-foreground");

  const tabBarWidth = Math.min(width * 0.78, 380);
  const tabBarStart = (width - tabBarWidth) / 2;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: tabBarTranslateY.value }],
    };
  });

  return (
    <Animated.View
      pointerEvents="auto"
      style={[
        animatedStyle,
        {
          position: "absolute",
          bottom: 24,
          start: tabBarStart,
          width: tabBarWidth,
          height: 68,
          borderRadius: 32,
          borderWidth: 1,
          borderColor: border,
          backgroundColor: card,
          ...getDirectionalRowStyle(direction),
          alignItems: "center",
          justifyContent: "space-around",
          paddingHorizontal: 12,
          opacity: 1,
          zIndex: 100,
          elevation: 8,
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        const label = options.title || route.name;
        const color = isFocused ? foreground : mutedForeground;
        const renderIcon = options.tabBarIcon;

        return (
          <AnimatedTabBarButton
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            accessibilityState={isFocused ? { selected: true } : {}}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              height: 52,
              borderRadius: 28,
              marginVertical: 6,
            }}
          >
            <View className="items-center justify-center flex-col">
              {renderIcon ? (
                renderIcon({ focused: isFocused, color, size: 24 })
              ) : (
                <AppIcon name="worker" size={24} color={color} />
              )}
              <AppText
                style={{ color, fontSize: 11, marginTop: 2 }}
                className={`font-semibold text-center ${
                  isFocused ? "font-bold text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </AppText>
            </View>
          </AnimatedTabBarButton>
        );
      })}
    </Animated.View>
  );
}

function WorkerTabsContent() {
  const { t } = useI18n();
  const background = useThemeToken("--background");

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <WorkerCollapsibleTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          lazy: true,
          freezeOnBlur: true,
          sceneStyle: {
            backgroundColor: background,
          },
        }}
      >
        <Tabs.Screen
          name="worker/index"
          options={{
            title: t("worker.tab.assigned"),
            tabBarIcon: ({ color, size }) => (
              <AppIcon
                accessibilityLabel={t("worker.tab.assigned")}
                color={color}
                name="worker"
                size={size}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="assets/index"
          options={{
            title: t("tabs.assets"),
            tabBarIcon: ({ color, size }) => (
              <AppIcon
                accessibilityLabel={t("tabs.assets")}
                color={color}
                name="inspection"
                size={size}
              />
            ),
          }}
        />
      </Tabs>
      <PortalHost name="worker-tabs-root" />
    </View>
  );
}

export default function WorkerTabsLayout() {
  return (
    <ScrollAnimationProvider>
      <PortalProvider>
        <WorkerTabsContent />
      </PortalProvider>
    </ScrollAnimationProvider>
  );
}
