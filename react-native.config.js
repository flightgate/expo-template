module.exports = {
  dependencies: {
    // expo-modules-autolinking's legacy react-native-config resolver mis-detects
    // ExpoModulesPackage.kt (which implements ReactPackage) and guesses the wrong
    // Java package (`expo.core` from the gradle `namespace`, instead of the real
    // `expo.modules` package declared in the file), producing a PackageList.java
    // that fails to compile. Override it with the correct import.
    expo: {
      platforms: {
        android: {
          packageImportPath: 'import expo.modules.ExpoModulesPackage;',
          packageInstance: 'new ExpoModulesPackage()',
        },
      },
    },
  },
};
