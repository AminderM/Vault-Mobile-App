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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BRAND, useTheme, createThemedStyleSheet } from '../lib/theme';

const CHAT_STORAGE_KEY = 'vault_chat_messages';

const INITIAL_MESSAGES = [
  {
    id: 'init_1',
    sender: 'dispatcher',
    text: 'Welcome to your carrier dispatch channel. Assigned loads will be listed on your Home board.',
    timestamp: '10:00 AM',
  },
  {
    id: 'init_2',
    sender: 'dispatcher',
    text: 'Please log your gate check-in/out times for Stop 1 and Stop 2 directly in the active load updates.',
    timestamp: '10:01 AM',
  },
];

const DISPATCH_RESPONSES = [
  "Copy that. Update Stop 1 gate times when arrived.",
  "Understood. Please upload BOL/POD once delivery is signed.",
  "Perfect, documents received and approved in TMS.",
  "Understood. Keep us updated on traffic or delays.",
  "Roger that, dispatcher notified.",
  "Dispatched order details updated. Check your Home tab.",
];

export default function ChatScreen() {
  const { t: T } = useTheme();
  const styles = useStyles();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);

  // Load chat history
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const stored = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
        if (stored) {
          setMessages(JSON.parse(stored));
        } else {
          setMessages(INITIAL_MESSAGES);
        }
      } catch {
        setMessages(INITIAL_MESSAGES);
      }
    };
    loadMessages();
  }, []);

  // Save messages
  const saveMessages = async (newMessages) => {
    try {
      await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(newMessages));
    } catch (err) {
      console.warn('Failed to save chat history', err);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    // eslint-disable-next-line react-hooks/purity
    const timeStr = new Date().toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });

    // eslint-disable-next-line react-hooks/purity
    const userMessage = {
      // eslint-disable-next-line react-hooks/purity
      id: `msg_${Date.now()}`,
      sender: 'driver',
      text: inputText.trim(),
      timestamp: timeStr,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveMessages(updatedMessages);
    setInputText('');

    // Trigger dispatcher response simulation
    setIsTyping(true);
    setTimeout(() => {
      const responseText = selectResponse(userMessage.text);
      // eslint-disable-next-line react-hooks/purity
      const dispTime = new Date().toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });
      // eslint-disable-next-line react-hooks/purity
      const dispMessage = {
        // eslint-disable-next-line react-hooks/purity
        id: `msg_${Date.now() + 1}`,
        sender: 'dispatcher',
        text: responseText,
        timestamp: dispTime,
      };

      const finalMessages = [...updatedMessages, dispMessage];
      setMessages(finalMessages);
      saveMessages(finalMessages);
      setIsTyping(false);
    }, 1500);
  };

  const selectResponse = (userText) => {
    const text = userText.toLowerCase();
    if (text.includes('arrive') || text.includes('here') || text.includes('check')) {
      return "Roger that. Proceed to load/unload and remember to update load status.";
    }
    if (text.includes('document') || text.includes('pod') || text.includes('bol') || text.includes('paper')) {
      return "Got it. Make sure the signatures are clearly visible before saving to the load.";
    }
    if (text.includes('delay') || text.includes('traffic') || text.includes('flat') || text.includes('break')) {
      return "Safety first. We will update the receiver of the new ETA. Stay safe!";
    }
    // Random fallback
    // eslint-disable-next-line react-hooks/purity
    return DISPATCH_RESPONSES[Math.floor(Math.random() * DISPATCH_RESPONSES.length)];
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

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.dispatcherBadge}>
            <Text style={{ fontSize: 18 }}>📞</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Carrier Dispatch</Text>
            <Text style={styles.headerSubtitle}>Emergent Logistics TMS • Online</Text>
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

        {isTyping && (
          <View style={styles.typingContainer}>
            <ActivityIndicator size="small" color={T.primary} style={{ marginRight: 6 }} />
            <Text style={styles.typingText}>Carrier Dispatcher is typing...</Text>
          </View>
        )}

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type message to dispatcher..."
            placeholderTextColor={T.text.muted}
            onSubmitEditing={handleSend}
            editable={!isTyping}
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendBtn,
              pressed && styles.pressed,
              !inputText.trim() && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isTyping}
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
