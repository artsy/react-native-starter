import {
  Box,
  Button,
  Flex,
  Input,
  Spacer,
  Text,
  useColor,
  useSpace,
} from "@artsy/palette-mobile"
import { FormikProvider, useFormik, useFormikContext } from "formik"
import { useRef } from "react"
import {
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native"
import LinearGradient from "react-native-linear-gradient"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import * as Yup from "yup"
import { GlobalStore } from "store/GlobalStore"
import { logger } from "system/logger"

export interface LoginSchema {
  email: string
  password: string
}

export const loginSchema = Yup.object().shape({
  email: Yup.string().email("Please provide a valid email address"),
  password: Yup.string().test(
    "password",
    "Password field is required",
    (value) => value !== ""
  ),
})


const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=net.artsy.app"
const PLAY_STORE_SCHEME_URL = "artsy://"
const APP_STORE_URL =
  "https://apps.apple.com/us/app/artsy-buy-sell-original-art/id703796080"
const APP_SCHEME_URL = "artsy:///"

export const LoginScreenContent: React.FC = () => {
  const color = useColor()
  const space = useSpace()
  const insets = useSafeAreaInsets()

  const {
    values,
    handleSubmit,
    handleChange,
    validateForm,
    errors,
    isValid,
    dirty,
    isSubmitting,
    setErrors,
  } = useFormikContext<LoginSchema>()

  const passwordInputRef = useRef<Input>(null)
  const emailInputRef = useRef<Input>(null)

  // TODO: Test this on Android
  const handleOpenArtsyMobile = async () => {
    const storeURL = Platform.OS === "android" ? PLAY_STORE_URL : APP_STORE_URL
    const appSchemeURL =
      Platform.OS === "android" ? PLAY_STORE_SCHEME_URL : APP_SCHEME_URL

    try {
      const supported = await Linking.canOpenURL(appSchemeURL)

      if (supported) {
        Linking.openURL(appSchemeURL)
      } else {
        Linking.openURL(storeURL)
      }
    } catch (error) {
      logger.error(
        "couldn't open artsy mobile app",
        error instanceof Error ? error : undefined
      )
    }
  }

  return (
    <LinearGradient
      colors={["#8D8D8D", "#999999", "#A9A9A9", "#B9B9B9", "#838383", "#6A6A6A"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1, flexGrow: 1 }}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top,
          paddingHorizontal: space(2),
        }}
        keyboardShouldPersistTaps="always"
        bounces={false}
      >
        <Text variant="xl" color="white100" weight="medium">
          Folio
        </Text>
        <Spacer y={6} />
        <Text variant="lg-display" color="white100">
          Log In
        </Text>
        <Text variant="sm" color="white100">
          With Your Artsy Partner Account
        </Text>
        <Spacer y={4} />
        <Box>
          <Input
            ref={emailInputRef}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={(text) => {
              handleChange("email")(text.trim())
            }}
            onSubmitEditing={() => {
              validateForm()
              passwordInputRef.current?.focus()
            }}
            onBlur={() => validateForm()}
            blurOnSubmit={false} // This is needed to avoid UI jump when the user submits
            placeholder="Email address"
            placeholderTextColor={color("black30")}
            title="Email"
            value={values.email}
            returnKeyType="next"
            spellCheck={false}
            autoCorrect={false}
            // We need to to set textContentType to username (instead of emailAddress) here
            // enable autofill of login details from the device keychain.
            textContentType="username"
            error={errors.email}
          />
          <Spacer y={2} />
          <Input
            autoCapitalize="none"
            autoComplete="password"
            autoCorrect={false}
            onChangeText={(text) => {
              // Hide error when the user starts to type again
              if (errors.password) {
                setErrors({
                  password: undefined,
                })
                validateForm()
              }
              handleChange("password")(text)
            }}
            onSubmitEditing={() => handleSubmit()}
            onBlur={() => validateForm()}
            placeholder="Password"
            placeholderTextColor={color("black30")}
            ref={passwordInputRef}
            secureTextEntry
            title="Password"
            returnKeyType="done"
            // We need to to set textContentType to password here
            // enable autofill of login details from the device keychain.
            textContentType="password"
            value={values.password}
            error={errors.password}
          />
        </Box>

        <Spacer y={1} />

        <TouchableOpacity
          onPress={() => {
            Alert.alert("Oups, not yet implemented")
          }}
        >
          <Text
            variant="sm"
            color="white100"
            style={{ textDecorationLine: "underline" }}
            textAlign="right"
          >
            Forgot password?
          </Text>
        </TouchableOpacity>

        <Spacer y={4} />

        <Button
          onPress={() => handleSubmit()}
          block
          haptic="impactMedium"
          // isSubmitting to prevent weird appearances of the errors caused by async submitting
          disabled={!(isValid && dirty) || isSubmitting}
          loading={isSubmitting}
          testID="loginButton"
          variant="fillDark"
        >
          Log in
        </Button>

        <Spacer y={2} />

        <Text variant="xs" color="white100" textAlign="center">
          Once you log in. Artsy Folio will begin downloading your artworks. We
          recommend using a stable Wifi connection.
        </Text>
      </ScrollView>
      <Flex px={2} pb={4}>
        <TouchableOpacity onPress={handleOpenArtsyMobile}>
          <Flex flexDirection="row">
            <Image
              resizeMode="contain"
              style={{ height: 50, width: 50 }}
              source={require("assets/images/short-white-logo.png")}
            />
            <Text color="white100" ml={1} textAlign="left">
              Looking for Artsy Mobile?{"\n"}Tap here to open
            </Text>
          </Flex>
        </TouchableOpacity>
      </Flex>
    </LinearGradient>
  )
}

const initialValues: LoginSchema = { email: "", password: "" }

export const LoginScreen = () => {
  const formik = useFormik<LoginSchema>({
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: true,
    initialValues,
    initialErrors: {},
    onSubmit: ({ email, password }) => {
      GlobalStore.actions.auth
        .signInUsingEmail({ email, password })
        .then((res: { success: boolean; message: string | null }) => {
          if (!res.success && res.message) {
            Alert.alert(res.message)
          }
        })
        .catch((error: string) => {
          logger.warn(error)
        })
    },
    validationSchema: loginSchema,
  })

  return (
    <FormikProvider value={formik}>
      <LoginScreenContent />
    </FormikProvider>
  )
}
