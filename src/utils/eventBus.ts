import { Events } from '@/typings/common';

class EventBus {
  public events: Object;

  constructor() {
    this.events = {};
  }

  emit<T>(eventName: string, data: T) {
    if (this.events[eventName]) {
      this.events[eventName].forEach((fn: Function) => {
        fn(data);
      });
    }
  }

  on(eventName: string, fn: Function) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(fn);
  }

  off(eventName: string, fn: Function) {
    if (this.events[eventName]) {
      for (let i = 0; i < this.events[eventName].length; i++) {
        if (this.events[eventName][i] === fn) {
          this.events[eventName].splice(i, 1);
          break;
        }
      }
    }
  }
}

const $bus = new EventBus();

const events: Events = {
  events: $bus.events,
  emit: $bus.emit,
  on: $bus.on,
  off: $bus.off,
};

export default events;
