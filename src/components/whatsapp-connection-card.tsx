import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { supabase } from '@/lib/supabase';
import { colors } from '@/theme/colors';

type Connection = {
  wa_id: string;
  display_phone: string | null;
  connected_at: string;
};

type LinkCode = {
  code: string;
  expiresAt: string;
};

function maskedPhone(connection: Connection) {
  if (connection.display_phone) return connection.display_phone;
  const suffix = connection.wa_id.slice(-4);
  return `Número final ${suffix}`;
}

export function WhatsAppConnectionCard() {
  const [connection, setConnection] = useState<Connection | null>(null);
  const [linkCode, setLinkCode] = useState<LinkCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConnection = useCallback(async () => {
    setError(null);
    const { data, error: readError } = await supabase
      .from('whatsapp_connections')
      .select('wa_id,display_phone,connected_at')
      .maybeSingle();

    if (readError) setError('Não foi possível verificar a conexão com o WhatsApp.');
    else {
      setConnection(data as Connection | null);
      if (data) setLinkCode(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Supabase is an external data source; the async callback updates the connection state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadConnection();
  }, [loadConnection]);

  const generateCode = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    const { data, error: codeError } = await supabase.rpc('request_whatsapp_link_code');
    const result = Array.isArray(data) ? data[0] : null;

    if (codeError || !result) {
      setError('Não foi possível gerar o código. Tente novamente.');
    } else {
      setLinkCode({ code: result.code, expiresAt: result.expires_at });
    }
    setSubmitting(false);
  };

  const disconnect = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    const { error: deleteError } = await supabase
      .from('whatsapp_connections')
      .delete()
      .eq('wa_id', connection?.wa_id ?? '');

    if (deleteError) setError('Não foi possível desconectar o WhatsApp.');
    else {
      setConnection(null);
      setLinkCode(null);
    }
    setSubmitting(false);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <Text style={styles.title}>WhatsApp</Text>
          <Text style={styles.subtitle}>Registre e consulte seus dados por mensagem.</Text>
        </View>
        <View style={[styles.status, connection && styles.statusConnected]}>
          <View style={[styles.statusDot, connection && styles.statusDotConnected]} />
          <Text style={[styles.statusText, connection && styles.statusTextConnected]}>
            {connection ? 'Conectado' : 'Desconectado'}
          </Text>
        </View>
      </View>

      {loading ? <ActivityIndicator color={colors.primary} /> : null}

      {!loading && connection ? (
        <>
          <Text style={styles.description}>{maskedPhone(connection)}</Text>
          <Pressable disabled={submitting} onPress={() => void disconnect()} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>{submitting ? 'Desconectando...' : 'Desconectar'}</Text>
          </Pressable>
        </>
      ) : null}

      {!loading && !connection && !linkCode ? (
        <>
          <Text style={styles.description}>
            Gere um código temporário e envie para o bot oficial do GYMcontrol.
          </Text>
          <Pressable disabled={submitting} onPress={() => void generateCode()} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{submitting ? 'Gerando...' : 'Gerar código de conexão'}</Text>
          </Pressable>
        </>
      ) : null}

      {!loading && !connection && linkCode ? (
        <View style={styles.codeArea}>
          <Text style={styles.codeLabel}>Envie este código para o bot</Text>
          <Text selectable style={styles.code}>{linkCode.code}</Text>
          <Text style={styles.expiration}>
            Válido até {new Date(linkCode.expiresAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.
          </Text>
          <View style={styles.actions}>
            <Pressable disabled={submitting} onPress={() => void generateCode()} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Gerar outro</Text>
            </Pressable>
            <Pressable disabled={submitting} onPress={() => void loadConnection()} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Já enviei o código</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!connection ? <Text style={styles.notice}>O número oficial será disponibilizado quando o canal do bot for ativado.</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 14, padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#214B35', backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  heading: { flex: 1, gap: 3 },
  title: { color: colors.text, fontSize: 18, fontWeight: '900' },
  subtitle: { color: colors.textSecondary, fontSize: 12, lineHeight: 17 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, backgroundColor: '#282D31' },
  statusConnected: { backgroundColor: '#173724' },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.textSecondary },
  statusDotConnected: { backgroundColor: colors.success },
  statusText: { color: colors.textSecondary, fontSize: 10, fontWeight: '800' },
  statusTextConnected: { color: '#8BE5A8' },
  description: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
  primaryButton: { flex: 1, minHeight: 46, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 13, borderRadius: 12, backgroundColor: colors.primary },
  primaryButtonText: { color: colors.text, textAlign: 'center', fontSize: 12, fontWeight: '900' },
  secondaryButton: { flex: 1, minHeight: 46, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 13, borderWidth: 1, borderColor: colors.border, borderRadius: 12 },
  secondaryButtonText: { color: colors.textSecondary, textAlign: 'center', fontSize: 12, fontWeight: '800' },
  codeArea: { gap: 10 },
  codeLabel: { color: colors.textSecondary, textAlign: 'center', fontSize: 12, fontWeight: '700' },
  code: { color: colors.text, textAlign: 'center', fontSize: 30, fontWeight: '900', letterSpacing: 2 },
  expiration: { color: colors.textSecondary, textAlign: 'center', fontSize: 11 },
  actions: { flexDirection: 'row', gap: 10 },
  error: { color: '#FFB4B7', fontSize: 12, lineHeight: 18 },
  notice: { color: '#D7A65B', fontSize: 11, lineHeight: 16 },
});
