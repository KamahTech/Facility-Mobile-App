import React from "react";
import { View, Pressable, Alert, Modal } from "react-native";
import { AppText } from "@/components/app-text";
import { AppRow } from "@/components/app-row";
import { AppIcon } from "@/components/app-icon";
import { AppInput } from "@/components/app-input";
import { AppActivityIndicator } from "@/components/app-activity-indicator";
import { useI18n } from "@/hooks/use-i18n";
import { useFamilyMembersQuery, useUnitStore } from "@/stores/unit-store";

type UnitFamilyMembersCardProps = {
  unitId: string;
};

export function UnitFamilyMembersCard({ unitId }: UnitFamilyMembersCardProps) {
  const { t } = useI18n();
  const { data, isLoading, refetch, error: queryError } = useFamilyMembersQuery(unitId);
  const { approveFamilyMember, rejectFamilyMember } = useUnitStore();

  const [rejectingLinkId, setRejectingLinkId] = React.useState<string | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");

  const handleApprove = (unitLinkId: string) => {
    Alert.alert(
      t("familyTenant.approve"),
      t("familyTenant.approveConfirm"),
      [
        { text: t("actions.cancel"), style: "cancel" },
        {
          text: t("familyTenant.approve"),
          onPress: async () => {
            try {
              await approveFamilyMember(unitLinkId);
              Alert.alert(t("common.success"), t("common.ok"));
              refetch();
            } catch (e: any) {
              Alert.alert(t("common.error"), e?.message || "Failed to approve request");
            }
          },
        },
      ]
    );
  };

  const handleRejectSubmit = async () => {
    if (!rejectingLinkId) return;
    if (!rejectReason.trim()) {
      Alert.alert(t("common.error"), t("validation.required"));
      return;
    }
    const linkId = rejectingLinkId;
    setRejectingLinkId(null);
    try {
      await rejectFamilyMember(linkId, rejectReason.trim());
      Alert.alert(t("common.success"), t("common.ok"));
      setRejectReason("");
      refetch();
    } catch (e: any) {
      Alert.alert(t("common.error"), e?.message || "Failed to reject request");
    }
  };

  if (isLoading) {
    return (
      <View className="w-full bg-card rounded-3xl p-5 shadow-sm justify-center items-center py-8 border border-border/20">
        <AppActivityIndicator size="small" />
      </View>
    );
  }

  // Hide the card if the user does not have permission to view family members (e.g. Odoo returns 403)
  if (queryError) {
    return null;
  }

  const familyMembers = data?.items || [];
  const managerRole = data?.managerRole || "owner";

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return {
          bg: "bg-emerald-950/40 border border-emerald-800/30",
          text: "text-emerald-400",
        };
      case "pending":
        return {
          bg: "bg-amber-950/40 border border-amber-800/30",
          text: "text-amber-400",
        };
      case "refused":
        return {
          bg: "bg-rose-950/40 border border-rose-800/30",
          text: "text-rose-400",
        };
      default:
        return {
          bg: "bg-zinc-800 border border-zinc-700/30",
          text: "text-zinc-400",
        };
    }
  };

  return (
    <View className="w-full bg-card rounded-3xl p-5 flex-col gap-4 shadow-sm border border-border/20">
      <AppRow className="items-center justify-between">
        <AppRow className="items-center gap-2">
          <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center">
            <AppIcon name="security" size={16} colorToken="--primary" />
          </View>
          <AppText className="text-start text-base font-bold text-foreground">
            {t("familyTenant.familyMembers")}
          </AppText>
        </AppRow>

        <View className="px-2 py-0.5 rounded bg-secondary/80">
          <AppText className="text-[10px] text-muted-foreground uppercase font-semibold">
            {t("familyTenant.managerRole").replace("{role}", t(`connectUnit.${managerRole}` as any))}
          </AppText>
        </View>
      </AppRow>

      {familyMembers.length === 0 ? (
        <AppText className="text-start text-sm text-muted-foreground py-2 px-1">
          {t("familyTenant.noFamily")}
        </AppText>
      ) : (
        <View className="flex-col gap-4">
          {familyMembers.map((member, idx) => {
            const status = getStatusStyle(member.approvalStatus);
            return (
              <View key={member.id} className={`flex-col gap-3 ${idx > 0 ? "pt-3 border-t border-border/20" : ""}`}>
                <AppRow className="justify-between items-start">
                  <View className="flex-col flex-1 text-start">
                    <AppText className="text-sm font-semibold text-foreground text-start">
                      {member.residentName}
                    </AppText>
                    <AppText className="text-xs text-muted-foreground text-start mt-0.5">
                      {member.residentEmail}
                    </AppText>
                    {member.contactNumber ? (
                      <AppText className="text-xs text-muted-foreground text-start mt-0.5">
                        {member.contactNumber}
                      </AppText>
                    ) : null}
                  </View>

                  <View className={`px-2.5 py-0.5 rounded-full ${status.bg}`}>
                    <AppText className={`text-[10px] font-bold uppercase ${status.text}`}>
                      {member.approvalStatus}
                    </AppText>
                  </View>
                </AppRow>

                {member.approvalStatus === "pending" && (
                  <AppRow className="gap-2.5 mt-1 justify-end">
                    <Pressable
                      onPress={() => setRejectingLinkId(member.id)}
                      accessibilityLabel={t("familyTenant.reject")}
                      accessibilityRole="button"
                      className="px-3.5 py-1.5 rounded-xl border border-destructive/30 active:opacity-60"
                    >
                      <AppText className="text-xs font-bold text-destructive">
                        {t("familyTenant.reject")}
                      </AppText>
                    </Pressable>

                    <Pressable
                      onPress={() => handleApprove(member.id)}
                      accessibilityLabel={t("familyTenant.approve")}
                      accessibilityRole="button"
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 active:opacity-60"
                    >
                      <AppText className="text-xs font-bold text-white">
                        {t("familyTenant.approve")}
                      </AppText>
                    </Pressable>
                  </AppRow>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Reject Reason Dialog Modal */}
      <Modal
        visible={!!rejectingLinkId}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setRejectingLinkId(null);
          setRejectReason("");
        }}
      >
        <View className="flex-1 bg-black/60 items-center justify-center p-6">
          <View className="w-full max-w-sm bg-card rounded-3xl p-6 shadow-xl flex-col gap-5 border border-border/20">
            <AppText className="text-start text-lg font-bold text-foreground">
              {t("familyTenant.reject")}
            </AppText>

            <AppInput
              label={t("familyTenant.reasonPlaceholder")}
              placeholder={t("familyTenant.reasonPlaceholder")}
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={3}
            />

            <AppRow className="justify-end gap-3 mt-2">
              <Pressable
                onPress={() => {
                  setRejectingLinkId(null);
                  setRejectReason("");
                }}
                className="px-4 py-2 rounded-xl bg-secondary active:opacity-60"
              >
                <AppText className="text-sm font-semibold text-muted-foreground">
                  {t("actions.cancel")}
                </AppText>
              </Pressable>

              <Pressable
                onPress={handleRejectSubmit}
                className="px-4 py-2 rounded-xl bg-destructive active:opacity-60"
              >
                <AppText className="text-sm font-semibold text-white">
                  {t("familyTenant.reject")}
                </AppText>
              </Pressable>
            </AppRow>
          </View>
        </View>
      </Modal>
    </View>
  );
}
