import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewNavigation } from 'react-native-webview';
import { useFocusEffect } from 'expo-router';

// Sobrescrito pelo runner (injectWebsiteWrapperAssets) antes do build — ver
// packages/specs/features/website-wrapper.md (US-61). O valor abaixo só é
// usado em desenvolvimento local do template em si.
import webviewConfig from '../webview.config.json';

const SITE_URL = webviewConfig.url;

export default function Index() {
  const webviewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);

  const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
  }, []);

  // Android: botão de voltar do sistema navega o histórico da WebView em vez
  // de fechar o app, enquanto houver histórico.
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return;

      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (canGoBack) {
          webviewRef.current?.goBack();
          return true;
        }
        return false;
      });

      return () => subscription.remove();
    }, [canGoBack]),
  );

  const handleRetry = useCallback(() => {
    setError(false);
    setLoading(true);
    webviewRef.current?.reload();
  }, []);

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Could not load the page</Text>
          <Text style={styles.errorSubtitle}>Check your internet connection and try again.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WebView
        ref={webviewRef}
        source={{ uri: SITE_URL }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => setError(true)}
        onHttpError={() => setError(true)}
        onNavigationStateChange={handleNavigationStateChange}
        startInLoadingState={false}
        allowsBackForwardNavigationGestures
        setSupportMultipleWindows={false}
      />
      {loading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
