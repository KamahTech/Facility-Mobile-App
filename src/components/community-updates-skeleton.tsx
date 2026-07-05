import React from "react";
import { View } from "react-native";

import { AppRow } from "@/components/app-row";
import { ShimmerPlaceholder } from "@/components/shimmer-placeholder";

/**
 * A beautiful skeleton loading indicator for Community Updates.
 * Renders placeholders matching both News and Poll card styles with pulsing shimmer animations.
 */
export function CommunityUpdatesSkeleton() {
  return (
    <View className="w-full flex-col gap-4">
      {/* News Card Skeleton */}
      <View className="w-full p-4 rounded-2xl border border-border bg-card">
        <AppRow className="gap-4 items-center justify-between">
          {/* Text Area Skeleton */}
          <View className="flex-1 flex-col gap-3 min-w-0">
            {/* Badge & Date Row */}
            <AppRow className="items-center gap-2 self-start">
              <ShimmerPlaceholder className="w-12 h-4 rounded-md" />
              <ShimmerPlaceholder className="w-16 h-3 rounded-md" />
            </AppRow>

            {/* Title Line */}
            <ShimmerPlaceholder className="w-[85%] h-5 rounded-md mt-1" />

            {/* Description Lines */}
            <View className="flex-col gap-1.5 mt-0.5">
              <ShimmerPlaceholder className="w-full h-3.5 rounded-md" />
              <ShimmerPlaceholder className="w-[70%] h-3.5 rounded-md" />
            </View>
          </View>

          {/* Image Area Skeleton */}
          <ShimmerPlaceholder className="size-20 rounded-xl" />
        </AppRow>
      </View>

      {/* Poll Card Skeleton */}
      <View className="w-full p-4 rounded-2xl border border-border bg-card flex-col gap-3.5">
        {/* Badge & Date Row */}
        <AppRow className="items-center gap-2">
          <ShimmerPlaceholder className="w-20 h-4 rounded-md" />
          <ShimmerPlaceholder className="w-16 h-3 rounded-md" />
        </AppRow>

        {/* Survey Question */}
        <ShimmerPlaceholder className="w-[90%] h-5 rounded-md mt-0.5" />

        {/* Options List */}
        <View className="flex-col gap-2.5 w-full mt-1.5">
          <ShimmerPlaceholder className="w-full h-12 rounded-xl" />
          <ShimmerPlaceholder className="w-full h-12 rounded-xl" />
          <ShimmerPlaceholder className="w-full h-12 rounded-xl" />
        </View>
      </View>
    </View>
  );
}
