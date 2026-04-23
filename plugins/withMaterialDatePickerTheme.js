const { withAndroidStyles, AndroidConfig } = require("@expo/config-plugins");

/**
 * @react-native-community/datetimepicker on Android can open MaterialDatePicker,
 * which throws if AppTheme does not inherit Theme.MaterialComponents (or define materialCalendarTheme).
 */
function withMaterialDatePickerTheme(config) {
  return withAndroidStyles(config, (modConfig) => {
    const styles = modConfig.modResults;
    const appTheme = AndroidConfig.Styles.getStyleParent(
      styles,
      AndroidConfig.Styles.getAppThemeGroup()
    );
    if (appTheme?.$) {
      appTheme.$.parent = "Theme.MaterialComponents.DayNight.NoActionBar";
    }
    return modConfig;
  });
}

module.exports = withMaterialDatePickerTheme;
