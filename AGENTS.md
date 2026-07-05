Follow the react js and react native best practices in the big projects

Use NativeWind for the styles

If the component has been implemented before use the reusable one, don't create the same component again

Make any component as a reusable component, and any function as a reusable function so you shouldn't type all the code in one file, make sure to split them to call it later when we want

Organize any code in the following directories (src/stores, src/providers, src/lib, src/hooks, src/constants, src/components, src/assets) then import the code to the place that will be used in to make the project oranized and clean

Make sure that every component you create use the arabic and english language using i18n

For any edit you do to the UI make sure that it is responsive

The app should support both rtl and ltr so use start and end instead of right and left

For any icon use expo-symbols icons

For lists that has a lot of items use legend list

Always use tanstack query for api calls

Always use reanimated for animation

Handle opening the keyboard with the text fields when the text field became under the keyboard space

For buttons use Pressable

Use expo-secure-store for sensitive data
