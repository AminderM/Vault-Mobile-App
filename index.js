import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

const ctx = require.context('./src/app');
const RootComponent = ExpoRoot({ ctx });

registerRootComponent(RootComponent);
