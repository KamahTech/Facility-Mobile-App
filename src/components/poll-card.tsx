import React from "react";
import { Pressable, View, StyleSheet, ActivityIndicator, Alert } from "react-native";

import { useI18n } from "@/hooks/use-i18n";
import { type TranslationKey } from "@/constants/translations";
import { AppRow } from "@/components/app-row";
import { AppText } from "@/components/app-text";
import { getLogicalStartStyle } from "@/lib/i18n-layout";
import { useCommunityStore, type CommunityPoll } from "@/stores/community-store";

type PollCardProps = {
  item: CommunityPoll;
  onPressHeader?: () => void;
};

export function PollCard({ item, onPressHeader }: PollCardProps) {
  const { direction, t } = useI18n();
  const { votePoll } = useCommunityStore();
  const [votingOptionId, setVotingOptionId] = React.useState<string | number | null>(null);

  const votedOptionId = item.votedOptionId || null;
  const votesData = item.options || [];
  const totalVotes = item.totalVotes || 0;

  const isClosed = item.pollStatus === "closed" || item.canVote === false;
  const showResults = !!votedOptionId || isClosed;

  const localizedQuestion = (() => {
    const key = `communityUpdates.${item.id}.question` as TranslationKey;
    const translated = t(key);
    return translated === key ? item.question : translated;
  })();
  const localizedDate = (() => {
    const key = `communityUpdates.${item.id}.date` as TranslationKey;
    const translated = t(key);
    return translated === key ? item.date : translated;
  })();

  const handleVote = async (optionId: string | number) => {
    // If clicking same option, do nothing
    if (votedOptionId !== null && String(votedOptionId) === String(optionId)) return;

    setVotingOptionId(optionId);
    try {
      await votePoll(item.id, optionId);
    } catch (e: unknown) {
      Alert.alert(t("common.error"), e instanceof Error ? e.message : t("errors.voteSubmitFailed"));
    } finally {
      setVotingOptionId(null);
    }
  };

  return (
    <View className="w-full p-4 rounded-2xl bg-card flex-col gap-3">
      {/* Clickable Header/Question block */}
      <Pressable
        onPress={onPressHeader}
        disabled={!onPressHeader}
        className="flex-col gap-3 w-full"
      >
        {/* Category Badge Row */}
        <AppRow className="items-center gap-2">
          <View className="bg-blue-100 dark:bg-blue-950/50 px-2 py-0.5 rounded-md">
            <AppText className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wide">
              {t("communityUpdates.surveyBadge")}
            </AppText>
          </View>
          {isClosed && (
            <View className="bg-destructive/10 px-2 py-0.5 rounded-md">
              <AppText className="text-[10px] font-bold text-destructive">
                {t("communityUpdates.pollClosed")}
              </AppText>
            </View>
          )}
          <AppText className="text-[10px] text-muted-foreground">
            {localizedDate}
          </AppText>
          {item.pollDeadlineDate && !isClosed && (
            <AppText className="text-[10px] text-muted-foreground">
              • {t("communityUpdates.pollEnds").replace("{{date}}", item.pollDeadlineDate)}
            </AppText>
          )}
        </AppRow>

        {/* Survey Question */}
        <AppText
          className="text-start text-base font-bold text-foreground leading-5 w-full"
        >
          {localizedQuestion}
        </AppText>
      </Pressable>

      {/* Options List */}
      <View className="flex-col gap-2 w-full mt-1">
        {votesData.map((option) => {
          const isVotedOption = votedOptionId !== null && String(votedOptionId) === String(option.id);
          const isVotingForThis = votingOptionId !== null && String(votingOptionId) === String(option.id);
          const percentage =
            totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;

          return (
            <Pressable
              key={option.id}
              disabled={!!votingOptionId || isClosed}
              onPress={() => handleVote(option.id)}
              className="w-full h-12 rounded-xl bg-muted/30 overflow-hidden relative justify-center px-4 animate-fade-in"
            >
              {/* Voted Progress Bar fill */}
              {showResults && (
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    {
                      width: `${percentage}%`,
                      ...getLogicalStartStyle(direction, "position", 0),
                    },
                  ]}
                  className={
                    isVotedOption
                      ? "bg-emerald-100 dark:bg-emerald-950/40"
                      : "bg-muted/70"
                  }
                />
              )}

              {/* Option Text and Percentage Row */}
              <AppRow className="justify-between items-center z-10 w-full">
                <AppRow className="items-center gap-2 flex-1 min-w-0">
                  <AppText
                    className={`text-sm flex-1 text-start ${
                      isVotedOption
                        ? "font-bold text-emerald-800 dark:text-emerald-300"
                        : "text-foreground"
                    }`}
                    numberOfLines={1}
                  >
                    {(() => {
                      const key = `communityUpdates.${item.id}.${option.id}` as TranslationKey;
                      const translated = t(key);
                      return translated === key ? option.text : translated;
                    })()}
                  </AppText>
                  {isVotingForThis && <ActivityIndicator size="small" color="#4F46E5" />}
                </AppRow>

                {/* Show percentage if voted or closed */}
                {showResults && (
                  <AppText
                    className={`text-xs ${
                      isVotedOption
                        ? "font-bold text-emerald-800 dark:text-emerald-300"
                        : "text-muted-foreground"
                    }`}
                  >
                    {percentage}%
                  </AppText>
                )}
              </AppRow>
            </Pressable>
          );
        })}
      </View>

      {/* Footer Info Row */}
      {showResults && (
        <AppRow className="justify-between items-center mt-1">
          {!!votedOptionId ? (
            <AppText className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              ✓ {t("communityUpdates.voted")}
            </AppText>
          ) : (
            <AppText className="text-[11px] font-medium text-muted-foreground">
              {t("communityUpdates.pollClosed")}
            </AppText>
          )}
          <AppText className="text-[11px] text-muted-foreground">
            {t("communityUpdates.votesCount").replace("{{count}}", String(totalVotes))}
          </AppText>
        </AppRow>
      )}
    </View>
  );
}
