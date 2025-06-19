import { TinyEmitter } from 'tiny-emitter';
import { TradingSignal } from './types';

// Create a singleton emitter instance
const emitter = new TinyEmitter();

export const signalEmitter = {
  emit: (signal: TradingSignal) => {
    emitter.emit('tradingSignal', signal);
  },
  on: (callback: (signal: TradingSignal) => void) => {
    emitter.on('tradingSignal', callback);
  },
  off: (callback: (signal: TradingSignal) => void) => {
    emitter.off('tradingSignal', callback);
  },
};