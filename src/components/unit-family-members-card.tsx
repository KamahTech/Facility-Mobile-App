import React from "react";
import { View, Pressable, Alert, Modal, Text } from "react-native";
import { AppRow } from "@/components/app-row";
import { AppIcon } from "@/components/app-icon";
import { AppInput } from "@/components/app-input";
import { AppActivityIndicator } from "@/components/app-activity-indicator";
import { useI18n } from "@/hooks/use-i18n";
import { allowsFamilyMembers } from "@/lib/family-member-eligibility";
import { useFamilyMembersQuery, useUnitStore } from "@/stores/unit-store";

type UnitFamilyMembersCardProps = {
  unitId: string;
};

export function UnitFamilyMembersCard({ unitId }: UnitFamilyMembersCardProps) {
  const { isRTL, t } = useI18n();
  const { units, approveFamilyMember, rejectFamilyMember } = useUnitStore();

  const connectedUnit = units.find((u) => u.id === unitId || u.unitId === unitId);
  const isFamilyEligible = allowsFamilyMembers(connectedUnit?.unitType);

  const { data, isLoading, refetch, error: queryError } = useFamilyMembersQuery(unitId, isFamilyEligible);

  const [rejectingLinkId, setRejectingLinkId] = React.useState<string | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");

  if (!isFamilyEligible) {
    return null;
  }

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
      <View className="w-full bg-card rounded-3xl p-5 shadow-sm justify-center items-center py-8">
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
    <View className="w-full bg-card rounded-3xl p-5 flex-col gap-4 shadow-sm">
      <AppRow className="items-center justify-between">
        <AppRow className="items-center gap-2">
          <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center">
            <AppIcon name="security" size={16} colorToken="--primary" />
          </View>
          <Text
            className="text-base font-bold text-foreground"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {t("familyTenant.familyMembers")}
          </Text>
        </AppRow>

        <View className="px-2 py-0.5 rounded bg-secondary/80">
          <Text
            className="text-[10px] text-muted-foreground uppercase font-semibold"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {t("familyTenant.managerRole").replace("{role}", t(`connectUnit.${managerRole}` as any))}
          </Text>
        </View>
      </AppRow>

      {familyMembers.length === 0 ? (
        <Text
          className="text-sm text-muted-foreground py-2 px-1"
          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
        >
          {t("familyTenant.noFamily")}
        </Text>
      ) : (
        <View className="flex-col gap-4">
          {familyMembers.map((member) => {
            const status = getStatusStyle(member.approvalStatus);
            return (
              <View
                key={member.id}
                className="w-full bg-muted/20 dark:bg-zinc-900/30 border border-border/10 rounded-2xl p-4 flex-col gap-3 shadow-2xs"
              >
                <AppRow className="justify-between items-start">
                  <AppRow className="items-center gap-3 flex-1 min-w-0">
                    {/* Avatar Circle with Name Initial */}
                    <View className="w-11 h-11 rounded-full bg-primary/10 items-center justify-center border border-primary/20">
                      <Text className="text-base font-extrabold text-primary uppercase">
                        {member.residentName.trim().charAt(0) || "?"}
                      </Text>
                    </View>

                    <View className="flex-col flex-1 min-w-0">
                      <Text
                        className="text-sm font-bold text-foreground"
                        style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                      >
                        {member.residentName}
                      </Text>
                      <Text
                        className="text-xs text-muted-foreground mt-0.5"
                        style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                      >
                        {member.residentEmail}
                      </Text>
                      {member.contactNumber ? (
                        <AppRow className="items-center gap-1 mt-1">
                          <AppIcon name="phone" size={12} colorToken="--muted-foreground" />
                          <Text
                            className="text-xs text-muted-foreground"
                            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                          >
                            {member.contactNumber}
                          </Text>
                        </AppRow>
                      ) : null}
                    </View>
                  </AppRow>

                  <View className={`px-2.5 py-0.5 rounded-full ${status.bg}`}>
                    <Text
                      className={`text-[10px] font-bold uppercase ${status.text}`}
                      style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                    >
                      {t(`connectUnit.${member.approvalStatus.toLowerCase()}` as any) === `connectUnit.${member.approvalStatus.toLowerCase()}` 
                        ? member.approvalStatus.toUpperCase() 
                        : t(`connectUnit.${member.approvalStatus.toLowerCase()}` as any)}
                    </Text>
                  </View>
                </AppRow>

                {member.approvalStatus === "pending" && (
                  <AppRow className="gap-2.5 mt-2 justify-end w-full">
                    <Pressable
                      onPress={() => setRejectingLinkId(member.id)}
                      accessibilityLabel={t("familyTenant.reject")}
                      accessibilityRole="button"
                      className="px-3.5 py-1.5 rounded-xl border border-rose-500/20 bg-rose-500/5 active:bg-rose-500/10 active:opacity-90 flex-row items-center gap-1.5"
                    >
                      <AppIcon name="close" size={14} colorToken="--destructive" />
                      <Text className="text-xs font-bold text-destructive">
                        {t("familyTenant.reject")}
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => handleApprove(member.id)}
                      accessibilityLabel={t("familyTenant.approve")}
                      accessibilityRole="button"
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 active:opacity-90 flex-row items-center gap-1.5 shadow-sm"
                    >
                      <AppIcon name="check" size={14} color="#FFFFFF" />
                      <Text className="text-xs font-bold text-white">
                        {t("familyTenant.approve")}
                      </Text>
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
            <Text
              className="text-lg font-bold text-foreground"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {t("familyTenant.reject")}
            </Text>

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
                <Text
                  className="text-sm font-semibold text-muted-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t("actions.cancel")}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleRejectSubmit}
                className="px-4 py-2 rounded-xl bg-destructive active:opacity-60"
              >
                <Text
                  className="text-sm font-semibold text-white"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t("familyTenant.reject")}
                </Text>
              </Pressable>
            </AppRow>
          </View>
        </View>
      </Modal>
    </View>
  );
}
