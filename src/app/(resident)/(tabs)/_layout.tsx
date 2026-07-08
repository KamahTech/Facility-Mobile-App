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

function CollapsibleTabBar({ state, descriptors, navigation }: any) {
  const { tabBarTranslateY } = useScrollAnimation();
  const { direction } = useI18n();
  const { width } = useWindowDimensions();

  const card = useThemeToken("--card");
  const border = useThemeToken("--border");
  const foreground = useThemeToken("--foreground");
  const mutedForeground = useThemeToken("--muted-foreground");

  const tabBarWidth = Math.min(width * 0.88, 420);
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
          paddingHorizontal: 8,
          opacity: 1,
          zIndex: 100,
          elevation: 8,
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        }
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
                <AppIcon name="home" size={24} color={color} />
              )}
              <AppText 
                style={{ color, fontSize: 11, marginTop: 2 }}
                className={`font-semibold text-center ${isFocused ? "font-bold text-foreground" : "text-muted-foreground"}`}
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

function TabsContent() {
  const { t } = useI18n();
  const background = useThemeToken("--background");

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <CollapsibleTabBar {...props} />}
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
          name="home"
          options={{
            title: t("tabs.home"),
            tabBarIcon: ({ color, size }) => (
              <AppIcon
                accessibilityLabel={t("tabs.home")}
                color={color}
                name="home"
                size={size}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="tickets"
          options={{
            title: t("tabs.tickets"),
            tabBarIcon: ({ color, size }) => (
              <AppIcon
                accessibilityLabel={t("tabs.tickets")}
                color={color}
                name="tickets"
                size={size}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t("tabs.profile"),
            tabBarIcon: ({ color, size }) => (
              <AppIcon
                accessibilityLabel={t("tabs.profile")}
                color={color}
                name="profile"
                size={size}
              />
            ),
          }}
        />
      </Tabs>
      <PortalHost name="tabs-root" />
    </View>
  );
}

export default function ResidentTabsLayout() {
  return (
    <ScrollAnimationProvider>
      <PortalProvider>
        <TabsContent />
      </PortalProvider>
    </ScrollAnimationProvider>
  );
}
