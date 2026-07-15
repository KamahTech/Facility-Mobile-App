import React from "react";
import {
  Modal,
  Keyboard,
  Platform,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import RNDateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import { AppIcon } from "@/components/app-icon";
import { AppInput } from "@/components/app-input";
import { AppRow } from "@/components/app-row";
import { useI18n } from "@/hooks/use-i18n";
import {
  formatDateTimeValue,
  parseDateTimeValue,
  type AppDateTimeMode,
} from "@/lib/date-time";

type AppDateTimeFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  mode: AppDateTimeMode;
  error?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  allowClear?: boolean;
};

export function AppDateTimeField({
  label,
  placeholder,
  value,
  onChange,
  mode,
  error,
  minimumDate,
  maximumDate,
  allowClear = false,
}: AppDateTimeFieldProps) {
  const { t } = useI18n();
  const { width: windowWidth } = useWindowDimensions();
  const [isOpen, setIsOpen] = React.useState(false);
  const [pendingValue, setPendingValue] = React.useState(() =>
    parseDateTimeValue(value, mode),
  );

  const openPicker = React.useCallback(() => {
    Keyboard.dismiss();
    setPendingValue(parseDateTimeValue(value, mode));
    setIsOpen(true);
  }, [mode, value]);

  const handleNativeChange = React.useCallback(
    (event: DateTimePickerEvent, selectedValue?: Date) => {
      if (Platform.OS === "android") {
        setIsOpen(false);
        if (event.type === "set" && selectedValue) {
          onChange(formatDateTimeValue(selectedValue, mode));
        }
        return;
      }

      if (selectedValue) setPendingValue(selectedValue);
    },
    [mode, onChange],
  );

  return (
    <View className="flex-col">
      <Pressable
        onPress={openPicker}
        accessibilityRole="button"
        accessibilityLabel={label}
        className="active:opacity-80"
      >
        <View pointerEvents="none">
          <AppInput
            label={label}
            placeholder={placeholder}
            value={value}
            editable={false}
            error={error}
          />
        </View>
        <View
          pointerEvents="none"
          className="absolute end-4 justify-center"
          style={{ top: 28, bottom: error ? 20 : 0 }}
        >
          <AppIcon name="calendar" size={18} colorToken="--muted-foreground" />
        </View>
      </Pressable>

      {isOpen && Platform.OS === "ios" && (
        <Modal
          transparent
          visible
          animationType="fade"
          onRequestClose={() => setIsOpen(false)}
        >
          <View className="flex-1 bg-black/50 items-center justify-center p-6">
            <View className="w-full max-w-sm bg-card rounded-3xl p-6 shadow-xl flex-col gap-5">
              <Text className="text-base font-bold text-foreground text-center">
                {label}
              </Text>
              <View className="items-center justify-center py-2">
                <RNDateTimePicker
                  value={pendingValue}
                  mode={mode}
                  display="spinner"
                  onChange={handleNativeChange}
                  minimumDate={minimumDate}
                  maximumDate={maximumDate}
                  style={{
                    width: Math.min(windowWidth - 96, 320),
                    height: 216,
                  }}
                />
              </View>
              <AppRow className="justify-end gap-3 mt-2 flex-wrap">
                {allowClear && (
                  <Pressable
                    onPress={() => {
                      onChange("");
                      setIsOpen(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-secondary active:opacity-60"
                  >
                    <Text className="text-sm font-semibold text-muted-foreground">
                      {t("actions.clear")}
                    </Text>
                  </Pressable>
                )}
                <Pressable
                  onPress={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl bg-secondary active:opacity-60"
                >
                  <Text className="text-sm font-semibold text-muted-foreground">
                    {t("actions.cancel")}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    onChange(formatDateTimeValue(pendingValue, mode));
                    setIsOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-primary active:opacity-60"
                >
                  <Text className="text-sm font-semibold text-primary-foreground">
                    {t("common.ok")}
                  </Text>
                </Pressable>
              </AppRow>
            </View>
          </View>
        </Modal>
      )}

      {isOpen && Platform.OS === "android" && (
        <RNDateTimePicker
          value={pendingValue}
          mode={mode}
          display="default"
          onChange={handleNativeChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
}
