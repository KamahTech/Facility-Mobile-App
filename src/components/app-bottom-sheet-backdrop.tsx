import { BottomSheetBackdrop, type BottomSheetBackdropProps } from "@gorhom/bottom-sheet";

export function AppBottomSheetBackdrop(props: BottomSheetBackdropProps) {
  return (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={0.35}
      pressBehavior="close"
    />
  );
}
