import React, { useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { apiService, getApiBaseUrl } from '../services/api';
import { SubscriptionPlanId } from '../data/subscriptionPlans';

interface Props {
  navigation: any;
  route: { params: { plan: SubscriptionPlanId } };
}

type Stage = 'creating_order' | 'checkout' | 'confirming' | 'success' | 'failed';

// Cashfree's hosted Web Checkout is driven entirely by their JS SDK — there's
// no React Native SDK to embed here, so this loads a minimal HTML page (via
// the WebView's own `source.html`, not a remote URL) that pulls in
// https://sdk.cashfree.com/js/v3/cashfree.js and calls .checkout() with the
// session id this screen already fetched from our backend.
function buildCheckoutHtml(paymentSessionId: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
</head>
<body style="margin:0;background:#fff;">
  <script>
    const cashfree = Cashfree({ mode: "production" });
    cashfree.checkout({
      paymentSessionId: "${paymentSessionId}",
      redirectTarget: "_self"
    });
  </script>
</body>
</html>`;
}

export const CashfreeCheckoutScreen: React.FC<Props> = ({ navigation, route }) => {
  const { plan } = route.params;
  const { user, refreshProfile } = useApp();
  const { colors: themeColors } = useTheme();
  const insets = useSafeAreaInsets();

  const [stage, setStage] = useState<Stage>('creating_order');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentSessionId, setPaymentSessionId] = useState<string | null>(null);
  const orderIdRef = useRef<string | null>(null);
  const settledRef = useRef(false);

  // The return_url the backend hands Cashfree — matched against WebView
  // navigation events to detect checkout completion without relying on the
  // fallback HTML page actually finishing its own load.
  const returnUrlPrefix = useMemo(() => {
    const apiOrigin = getApiBaseUrl().replace(/\/api\/v1$/, '');
    return `${apiOrigin}/api/v1/subscriptions/cashfree/return`;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const order = await apiService.createCashfreeOrder(user.id, plan);
        if (cancelled) return;
        orderIdRef.current = order.orderId;
        setPaymentSessionId(order.paymentSessionId);
        setStage('checkout');
      } catch (e: any) {
        if (cancelled) return;
        setErrorMessage(e?.message || 'Could not start checkout. Please try again.');
        setStage('failed');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [plan, user.id]);

  const handleNavStateChange = (navState: WebViewNavigation) => {
    if (settledRef.current) return;
    if (!navState.url.startsWith(returnUrlPrefix)) return;
    settledRef.current = true;
    confirmPayment();
  };

  // Cashfree's webhook is the source of truth for actually granting the
  // subscription (subscriptionController.handleCashfreeWebhook) — this just
  // polls the order status directly so the UI doesn't sit on a spinner
  // waiting on webhook delivery timing once the payer is already done.
  const confirmPayment = async () => {
    setStage('confirming');
    const orderId = orderIdRef.current;
    if (!orderId) {
      setStage('failed');
      setErrorMessage('Lost track of the order — please try again.');
      return;
    }
    for (let attempt = 0; attempt < 6; attempt++) {
      try {
        const { status } = await apiService.getCashfreeOrderStatus(orderId);
        if (status === 'PAID') {
          await refreshProfile();
          setStage('success');
          return;
        }
        if (status === 'EXPIRED' || status === 'TERMINATED') {
          setStage('failed');
          setErrorMessage('This payment did not complete.');
          return;
        }
      } catch {
        // transient — keep polling
      }
      await new Promise((r) => setTimeout(r, 1500));
    }
    setStage('failed');
    setErrorMessage("We couldn't confirm the payment yet. If money was deducted, it'll unlock shortly.");
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: themeColors.surfaceElevated }]}
          hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
        >
          <ArrowLeft size={20} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Checkout</Text>
        <View style={{ width: 36 }} />
      </View>

      {stage === 'creating_order' && (
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={[styles.statusText, { color: themeColors.textSecondary }]}>Opening secure checkout…</Text>
        </View>
      )}

      {stage === 'checkout' && paymentSessionId && (
        <WebView
          source={{ html: buildCheckoutHtml(paymentSessionId) }}
          onNavigationStateChange={handleNavStateChange}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.centerFill}>
              <ActivityIndicator size="large" color={themeColors.primary} />
            </View>
          )}
        />
      )}

      {stage === 'confirming' && (
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={[styles.statusText, { color: themeColors.textSecondary }]}>Confirming your payment…</Text>
        </View>
      )}

      {stage === 'success' && (
        <View style={styles.centerFill}>
          <Text style={[styles.resultTitle, { color: themeColors.textPrimary }]}>You're Pro 🎉</Text>
          <Text style={[styles.statusText, { color: themeColors.textSecondary }]}>Your plan is now active.</Text>
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: themeColors.primary }]}
            onPress={() => navigation.navigate('HomeTabs' as never)}
          >
            <Text style={[styles.doneBtnText, { color: themeColors.textInverse }]}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}

      {stage === 'failed' && (
        <View style={styles.centerFill}>
          <Text style={[styles.resultTitle, { color: themeColors.textPrimary }]}>Payment not completed</Text>
          <Text style={[styles.statusText, { color: themeColors.textSecondary }]}>{errorMessage}</Text>
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: themeColors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.doneBtnText, { color: themeColors.textInverse }]}>Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 10 },
  statusText: { fontSize: 14, textAlign: 'center' },
  resultTitle: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  doneBtn: { marginTop: 18, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12 },
  doneBtnText: { fontSize: 15, fontWeight: '700' }
});
