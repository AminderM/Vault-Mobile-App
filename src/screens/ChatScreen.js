import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDriverLoads } from '../lib/tms';
import { getChatMessages, sendChatMessage } from '../lib/api';
import { BRAND, useTheme, createThemedStyleSheet } from '../lib/theme';
const formatTime = (dateStr) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

export default function ChatScreen() {
  const { t: T } = useTheme();
  const styles = useStyles();
  const [activeLoad, setActiveLoad] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const flatListRef = useRef(null);

  // 1. Fetch active driver loads to find a load to chat about
  useEffect(() => {
    let active = true;
    const fetchActiveLoad = async () => {
      try {
        const loads = await getDriverLoads();
        if (!active) return;
        
        // Find the first active/assigned load, or latest load
        const activeStatuses = ['assigned', 'en_route_pickup', 'arrived_pickup', 'loaded', 'en_route_delivery', 'arrived_delivery'];
        const found = loads.find(l => activeStatuses.includes(l.status)) || loads[0];
        
        if (found) {
          setActiveLoad(found);
        } else {
          setIsLoading(false);
        }
      } catch (_err) {
        if (active) {
          console.warn('Failed to fetch driver loads for chat', _err);
          setIsLoading(false);
        }
      }
    };
    
    fetchActiveLoad();
    return () => { active = false; };
  }, []);

  // 2. Poll messages if we have an active load
  useEffect(() => {
    if (!activeLoad) return;
    
    let active = true;
    const pollMessages = async () => {
      try {
        const msgs = await getChatMessages(activeLoad.id);
        if (!active) return;
        
        const mapped = msgs.map(m => ({
          id: m.id || String(Math.random()),
          sender: m.sender_type === 'driver' ? 'driver' : 'dispatcher',
          text: m.content,
          timestamp: formatTime(m.sent_at),
        }));
        
        setMessages(mapped);
        setErrorMsg('');
      } catch (_err) {
        if (active && messages.length === 0) {
          setErrorMsg('Failed to load chat history.');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    pollMessages();
    const interval = setInterval(pollMessages, 4000);
    
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [activeLoad, messages.length]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || !activeLoad) return;

    setInputText('');
    try {
      await sendChatMessage(activeLoad.id, text);
      // Immediately refresh messages
      const msgs = await getChatMessages(activeLoad.id);
      const mapped = msgs.map(m => ({
        id: m.id || String(Math.random()),
        sender: m.sender_type === 'driver' ? 'driver' : 'dispatcher',
        text: m.content,
        timestamp: formatTime(m.sent_at),
      }));
      setMessages(mapped);
    } catch (_err) {
      Alert.alert('Send Failed', 'Could not send message. Please check connection.');
      setInputText(text);
    }
  };

  const renderItem = ({ item }) => {
    const isDriver = item.sender === 'driver';
    return (
      <View style={[styles.messageRow, isDriver ? styles.rowDriver : styles.rowDispatcher]}>
        <View style={[styles.bubble, isDriver ? styles.bubbleDriver : styles.bubbleDispatcher]}>
          <Text style={[styles.bubbleText, isDriver ? styles.textDriver : styles.textDispatcher]}>
            {item.text}
          </Text>
          <Text style={[styles.timeText, isDriver ? styles.timeDriver : styles.timeDispatcher]}>
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={T.primary} />
          <Text style={styles.loadingText}>Connecting to dispatcher...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!activeLoad) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topHeader}>
          <Text style={styles.headerTitle}>Carrier Dispatch</Text>
        </View>
        <View style={styles.centerContainer}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>💬</Text>
          <Text style={styles.noLoadTitle}>No Active Load Assigned</Text>
          <Text style={styles.noLoadSubtitle}>
            Your direct chat channel to the TMS dispatch team will automatically open when you are assigned an active load.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.dispatcherBadge}>
            <Text style={{ fontSize: 18 }}>📞</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>
              {activeLoad.order_number || `Load #${activeLoad.id.slice(0, 8).toUpperCase()}`}
            </Text>
            <Text style={styles.headerSubtitle}>Emergent Logistics TMS • Live Chat</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {errorMsg ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type message to dispatcher..."
            placeholderTextColor={T.text.muted}
            onSubmitEditing={handleSend}
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendBtn,
              pressed && styles.pressed,
              !inputText.trim() && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendBtnText}>➔</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const useStyles = createThemedStyleSheet((T) => {
  const isLight = T.background.base === '#edeef3';
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: 'transparent' },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: T.text.secondary,
    },
    noLoadTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: T.text.primary,
      marginBottom: 8,
      textAlign: 'center',
    },
    noLoadSubtitle: {
      fontSize: 14,
      color: T.text.secondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    topHeader: {
      height: 64,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      borderBottomWidth: 1.5,
      borderBottomColor: T.border.variant,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    dispatcherBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isLight ? 'rgba(138, 18, 27, 0.08)' : 'rgba(255, 255, 255, 0.08)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: T.border.variant,
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: T.text.primary,
    },
    headerSubtitle: {
      fontSize: 11,
      color: T.text.secondary,
      marginTop: 1,
    },
    keyboardView: { flex: 1 },
    listContent: {
      paddingHorizontal: 16,
      paddingVertical: 20,
      gap: 14,
    },
    messageRow: {
      flexDirection: 'row',
      width: '100%',
    },
    rowDriver: { justifyContent: 'flex-end' },
    rowDispatcher: { justifyContent: 'flex-start' },
    bubble: {
      maxWidth: '75%',
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    bubbleDriver: {
      backgroundColor: BRAND.crimsonRed,
      borderTopRightRadius: 2,
    },
    bubbleDispatcher: {
      backgroundColor: T.background.containerHighest,
      borderWidth: 1,
      borderColor: T.border.variant,
      borderTopLeftRadius: 2,
    },
    bubbleText: {
      fontSize: 14,
      lineHeight: 19,
    },
    textDriver: { color: '#ffffff' },
    textDispatcher: { color: T.text.primary },
    timeText: {
      fontSize: 9,
      marginTop: 4,
      alignSelf: 'flex-end',
    },
    timeDriver: { color: 'rgba(255, 255, 255, 0.7)' },
    timeDispatcher: { color: T.text.muted },
    typingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 6,
    },
    typingText: {
      fontSize: 11,
      color: T.text.secondary,
      fontStyle: 'italic',
    },
    errorBanner: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      paddingVertical: 8,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    errorText: {
      color: '#ef4444',
      fontSize: 12,
    },
    inputContainer: {
      flexDirection: 'row',
      padding: 12,
      borderTopWidth: 1.5,
      borderTopColor: T.border.variant,
      alignItems: 'center',
      gap: 10,
      backgroundColor: isLight ? '#edeef3' : T.background.base,
    },
    input: {
      flex: 1,
      height: 44,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: T.border.variant,
      backgroundColor: T.background.container,
      paddingHorizontal: 14,
      color: T.text.primary,
      fontSize: 14,
    },
    sendBtn: {
      width: 44,
      height: 44,
      borderRadius: 8,
      backgroundColor: BRAND.crimsonRed,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendBtnDisabled: {
      opacity: 0.5,
    },
    sendBtnText: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    pressed: { opacity: 0.8 },
  });
});
